import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBatchArtistsFromUsernames } from '../_lib/artistQueries.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { usernames } = req.body as { usernames?: string[] };
  
  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid usernames array' });
  }

  // Limit batch size to prevent abuse
  if (usernames.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 usernames per batch' });
  }

  try {
    // Clean and decode usernames
    const cleanUsernames = usernames.map(username => 
      decodeURIComponent(username).replace(/[\s,]/g, '')
    );

    const artists = await getBatchArtistsFromUsernames(cleanUsernames);
    res.status(200).json({ artists });
  } catch (err) {
    console.error('[api] getBatchArtistsFromUsernames', err);
    res.status(500).json({ error: 'Internal error' });
  }
} 