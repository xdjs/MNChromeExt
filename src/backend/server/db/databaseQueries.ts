import { drizzle } from 'drizzle-orm/postgres-js';
import {eq} from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema.js';
import { error } from 'console';

const SUPABASE_DB_CONNECTION = process.env.SUPABASE_DB_CONNECTION as string;

        
const connectionString = SUPABASE_DB_CONNECTION

// Disable prefetch as it is not supported for "Transaction" pool mode 
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, {schema});

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
    } catch (error) {
        console.error(`Error fecthing artist my Username: `, error);
    }
}