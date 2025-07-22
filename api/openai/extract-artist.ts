import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const {title} = req.body as {title?: string};
    if (!title) {
        return res.status(400).json({error: 'Missing title'})
    }

    try {
        const completion = await openAI.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective for simple extraction
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting artist names from YouTube video titles. 
          
          Rules:
          - Extract the main artist/musician name from the title
          - Focus on music-related content (songs, interviews, performances, covers)
          - Return only the artist name, nothing else
          - If the title contains multiple artists, return the main/first one
          - If the title is a remix, choose a remixer instead of the original track author.
          - If no clear artist is identifiable, return "null"
          - Remove extra words like "Official", "Music Video", etc.
          - YouTube Music titles often format as 'Artist - Song Title' while YouTube might be 'Song Title by Artist'. Extract accordingly.
          
          Examples:
          "Jane Remover Interview" → "Jane Remover"
          "Billie Eilish - Bad Guy (Official Music Video)" → "Billie Eilish"  
          "Radiohead Live at Madison Square Garden" → "Radiohead"
          "How to play guitar" → "null"
          "Taylor Swift ft. Ed Sheeran - Song Title" → "Taylor Swift"
          "Daft Punk - Doin' It Right (Sewerslvt Remix)" → "Sewerslvt"`
        },
        {
          role: "user", 
          content: `Extract the artist name from this YouTube title: "${title}"`
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 50,   // Short response expected
        });

        const name = completion.choices[0]?.message?.content?.trim();

        if (!name) {
            return res.status(200).json({artist:null});
        }

        console.log(`[OpenAI] Extracted "${name}" from title: "${title}"`);
        res.status(200).json({ artist: name });
     } catch (error) {
        console.error('[OpenAI] Extract artist error:', error);
        res.status(500).json({ error: 'Failed to extract artist name' });
      }
}