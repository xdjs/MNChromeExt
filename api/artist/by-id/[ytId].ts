import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getArtistFromYTid } from '../../_lib/artistQueries';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for your Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { ytId } = req.query as { ytId?: string };
  if (!ytId) return res.status(400).json({ error: 'Missing ytId' });

  try {
    const artist = await getArtistFromYTid(ytId);
    res.status(200).json(artist ?? { error: 'Not found' });
  } catch (err) {
    console.error('[api] getArtistFromYTid', err);
    res.status(500).json({ error: 'Internal error' });
  }
}