   // build.js
   import { build } from 'esbuild';
   import * as dotenv from 'dotenv';

   // read .env.local (fallback to .env if you like)
   dotenv.config({ path: '.env.local' });

   if (!process.env.YT_API_KEY) {
     console.error('❌  YT_API_KEY missing in .env.local');
     process.exit(1);
   }

   await build({
     entryPoints: ['src/connections/listener.ts'],
     bundle: true,
     format: 'iife',
     outfile: 'dist/content.js',
     define: {
       // turns every occurrence of process.env.YT_API_KEY into "actual-key"
       'process.env.YT_API_KEY': JSON.stringify(process.env.YT_API_KEY)
     }
   }).catch(() => process.exit(1));