// build.js
import { build } from 'esbuild';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Check if --production flag is passed
const isProduction = process.argv.includes('--production');
const nodeEnv = isProduction ? 'production' : 'development';

// read .env.local (fallback to .env if you like)
dotenv.config({ path: '.env.local' });

if (!process.env.YT_API_KEY) {
  console.error('❌  YT_API_KEY missing in .env.local');
  process.exit(1);
}

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

console.log(`🔨 Building extension for ${nodeEnv}...`);

try {
  // Build content script
  await build({
    entryPoints: ['src/connections/listener.ts'],
    bundle: true,
    format: 'iife',
    outfile: 'dist/content.js',
    minify: isProduction,
    sourcemap: !isProduction,
    define: {
      // turns every occurrence of process.env.YT_API_KEY into "actual-key"
      'process.env.YT_API_KEY': JSON.stringify(process.env.YT_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    },
    target: 'es2020',
    platform: 'browser'
  });

  // Build popup script
  await build({
    entryPoints: ['src/frontend/popup/main.js'],
    bundle: true,
    format: 'iife',
    outfile: 'dist/main.js',
    minify: isProduction,
    sourcemap: !isProduction,
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    },
    target: 'es2020',
    platform: 'browser'
  });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}