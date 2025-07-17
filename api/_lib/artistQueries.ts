import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { artists, urlmap } from '../../src/backend/server/db/schema.js';

export function getArtistFromYTid(ytId: string) {
  return db.query.artists.findFirst({
    where: eq(artists.youtubechannel, ytId)
  });
}

export function getArtistFromYTUsername(username: string) {
  return db.query.artists.findFirst({
    where: eq(artists.name, username)
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


    const urls = await getUrlMap();
    const artistlinks: string[] = [];
    for (const platform of urls) {
        let artistUrl = platform.appStringFormat;
        const value = artist[platform.siteName];
        if (!value) {
            continue;
        }
        artistUrl = platform.appStringFormat.replace("%@", value);
        console.log(artistUrl);
        artistlinks.push(artistUrl);
    }
    return artistlinks;
}