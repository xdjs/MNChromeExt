import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/backend/server/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL as string,
  },
}); 