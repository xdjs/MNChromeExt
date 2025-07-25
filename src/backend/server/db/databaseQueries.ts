import { drizzle } from 'drizzle-orm/postgres-js';
import {eq} from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema.js';

const client = postgres(process.env.SUPABASE_DB_CONNECTION!, {
  prepare: false,
  idle_timeout: 0,     // good for serverless
  max_lifetime: 15_000
});

export const db = drizzle(client, { schema });

export async function getArtistFromYTid(userID: string) {
    try {
        const result = await db.query.artists.findFirst({where: eq(schema.artists.youtubechannel, userID)});
        return result;
    } catch (error) {
        console.error(`Error fetching artist by Youtube ID: `, error);
    }
}

export async function getArtistFromYTUsername(Username: string) {
    Username = Username.toLowerCase();
    Username = Username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    console.log(Username);
    try {
        const result = await db.query.artists.findFirst({where: eq(schema.artists.lcname, Username)});
        return result;
    } catch (error) {
        console.error(`Error fetching artist by Username: `, error);
        return null;
    }
}

