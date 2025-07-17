import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrlMap, getArtistFromId, getMainUrls } from "../../_lib/artistQueries.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const {artist} = req.query as {artist: string};
    if (!artist) return res.status(400).json({ error: 'Missing ID' });

    try {

        const a = await getArtistFromId(artist);
        if (a) {
            let urls = await getMainUrls(a);
            res.status(200).json(urls ?? {error: 'not found'});
        } 
    } catch (err) {
        console.error('[api] getMainUrls', err);
        res.status(500).json({ error: 'Internal error' });
    }

}