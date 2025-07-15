import { eq } from 'drizzle-orm';
import { db } from './db';
import { artists } from '../../src/backend/server/db/schema.js';

export function getArtistFromYTid(ytId: string) {
  return db.query.artists.findFirst({
    where: eq(artists.youtubechannel, ytId)
  });
}

export function getArtistFromYTUsername(username: string) {
  return db.query.artists.findFirst({
    where: eq(artists.youtubechannel, username)
  });
}