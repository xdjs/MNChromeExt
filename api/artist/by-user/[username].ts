import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArtistFromYTUsername } from '../../_lib/artistQueries.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { username } = req.query as { username?: string };
  if (!username) return res.status(400).json({ error: 'Missing username' });

  try {
    const artist = await getArtistFromYTUsername(decodeURIComponent(username));
    res.status(200).json(artist ?? { error: 'Not found' });
  } catch (err) {
    console.error('[api] getArtistFromYTUsername', err);
    res.status(500).json({ error: 'Internal error' });
  }
}