import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUrlMap, getArtistFromId, getMainUrls } from "../../_lib/artistQueries.js";
import { inArray } from 'drizzle-orm';
import { db } from '../../_lib/db.js';
import { artists } from '../../../src/backend/server/db/schema.js';


export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const { id } = req.query as { id: string };
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    // Check if it's a comma-separated list (bulk request)
    const ids = id.split(',');
    const isBulk = ids.length > 1;

    try {
        if (isBulk) {
            // Bulk request: get multiple artists at once
            const artistsData = await db.query.artists.findMany({
                where: inArray(artists.id, ids)
            });

            // Use your existing getMainUrls function for each artist
            const linksByArtist = {};
            await Promise.all(artistsData.map(async (artist) => {
                const links = await getMainUrls(artist);
                linksByArtist[artist.id] = links;
            }));

            res.status(200).json(linksByArtist);
        } else {
            // Single request (existing logic)
            const a = await getArtistFromId(id);
            if (!a) {
                return res.status(404).json({ error: 'Artist not found' });
            }
            
            const urls = await getMainUrls(a);
            res.status(200).json(urls || []);
        }
    } catch (err) {
        console.error('[api] getMainUrls', err);
        res.status(500).json({ error: 'Internal error' });
    }

}