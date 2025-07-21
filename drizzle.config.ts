import { defineConfig } from 'drizzle-kit';
import fetch from 'node-fetch';
import fs from 'fs';



export default defineConfig({
  schema: './src/backend/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_CONNECTION as string,
  },
}); 