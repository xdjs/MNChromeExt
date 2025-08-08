import { eq, sql } from 'drizzle-orm';
import { db } from './db.js';
import { artists, urlmap } from '../../src/backend/server/db/schema.js';

function normalizeForLookup(input: string): string {
  return (input ?? '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/[⁄∕／]/g, '/') // normalize unicode slashes to '/'
    .replace(/[＄]/g, '$') // normalize fullwidth dollar to '$'
    .toLowerCase()
    .replace(/[\s,]+/g, ''); // remove spaces and commas only
}

export function getArtistFromYTid(ytId: string) {
  return db.query.artists.findFirst({
    where: eq(artists.youtubechannel, ytId)
  });
}

export async function getArtistFromYTUsername(username: string) {
  console.log(username);
  const normalized = normalizeForLookup(username);
  const result: any[] = await db.execute(
    sql`SELECT * FROM artists WHERE replace(replace(lower(lcname), ' ', ''), ',', '') = ${normalized} LIMIT 1`
  );
  return Array.isArray(result) && result.length > 0 ? result[0] : null;
}

export function getArtistFromId(id: string) {
    return db.query.artists.findFirst({
      where: eq(artists.id, id)
    });
  }

export async function getUrlMap() {
    return await db.query.urlmap.findMany();
}

export async function getMainUrls(artist: any) {
    if (!artist) {
        return [];
    }

    const urls = await getUrlMap();
    const artistlinks: any[] = [];
    
    for (const platform of urls) {
        if (!platform?.appStringFormat || !platform?.siteName) {
            continue;
        }
        
        let artistUrl = platform.appStringFormat;
        const value = artist[platform.siteName];
        
        if (!value || artistUrl === "https://www.youtube.com/channel/%@") {
            continue;
        }
        
        try {
            artistUrl = platform.appStringFormat.replace("%@", value);
            console.log(artistUrl);
            artistlinks.push({
                label: platform.siteName,
                url: artistUrl,
                image: platform.siteImage,
                order: platform.order || 0, // Default order if missing
                platform_type_list: platform.platformTypeList
            });
        } catch (err) {
            console.error(`Error processing platform ${platform.siteName}:`, err);
            continue; // Skip this platform and continue with others
        }
    }
    
    // Sort by order column (ascending)
    artistlinks.sort((a, b) => (a.order || 0) - (b.order || 0));
    return artistlinks;
}

export async function getBatchArtistsFromUsernames(usernames: string[]) {
  if (usernames.length === 0) return [];

  // Get all artists using raw SQL for proper special character handling
  const searchTerms = usernames.map(u => normalizeForLookup(u));

  // Single batched query using OR clause across normalized lcname
  const orConditions = searchTerms.map((term) =>
    sql`replace(replace(lower(lcname), ' ', ''), ',', '') = ${term}`
  );

  const whereClause = sql.join(orConditions, sql` OR `);
  const foundArtists: any[] = searchTerms.length > 0
    ? await db.execute(sql`SELECT * FROM artists WHERE ${whereClause}`)
    : [];

  // Get all artist IDs for batch link fetching
  const artistIds = foundArtists.map(artist => artist.id).filter(Boolean);
  
  // Fetch all links in parallel for better performance
  const allLinksPromises = artistIds.map(async (artistId) => {
    try {
      const links = await getMainUrls(foundArtists.find(a => a.id === artistId));
      return { artistId, links };
    } catch (err) {
      console.error(`Error getting links for artist ${artistId}:`, err);
      return { artistId, links: [] };
    }
  });

  const allLinksResults = await Promise.all(allLinksPromises);
  const linksMap = new Map(allLinksResults.map(({ artistId, links }) => [artistId, links]));

  // Map results back to requested usernames, preserving order
  const results = usernames.map(username => {
    const normalizeLc = (s: string | null | undefined) => normalizeForLookup(s ?? '');
    const artist = foundArtists.find(a => normalizeLc(a.lcname) === normalizeLc(username));
    if (artist) {
      return {
        ...artist,
        links: linksMap.get(artist.id) || []
      };
    }
    return null;
  });

  return results;
}