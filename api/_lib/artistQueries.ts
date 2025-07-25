import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { artists, urlmap } from '../../src/backend/server/db/schema.js';
import { use } from 'express/lib/application.js';

export function getArtistFromYTid(ytId: string) {
  return db.query.artists.findFirst({
    where: eq(artists.youtubechannel, ytId)
  });
}

export function getArtistFromYTUsername(username: string) {
    console.log(username);
  return db.query.artists.findFirst({
    where: eq(artists.lcname, username.toLowerCase())
  });
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
                order: platform.order || 0 // Default order if missing
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