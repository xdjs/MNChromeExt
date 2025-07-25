import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrlMap, getArtistFromId, getMainUrls } from "../../_lib/artistQueries.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const {id} = req.query as {id: string};
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    try {
        const a = await getArtistFromId(id);
        if (!a) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        const urls = await getMainUrls(a);
        res.status(200).json(urls || []);
    } catch (err) {
        console.error('[api] getMainUrls', err);
        res.status(500).json({ error: 'Internal error' });
    }

}