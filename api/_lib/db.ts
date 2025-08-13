import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../src/backend/server/db/schema.js';

const client = postgres(process.env.SUPABASE_DB_CONNECTION!, {
  prepare: false,
  idle_timeout: 0,     // good for serverless
  max_lifetime: 15_000
});

export const db = drizzle(client, {
  schema,
  logger: {
    logQuery(query, params) {
      // Print the generated SQL and bound parameters
      console.log('[drizzle] SQL:', query);
      if (params && params.length) {
        console.log('[drizzle] Params:', params);
      }
    }
  }
});