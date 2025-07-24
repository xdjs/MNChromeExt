import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS for your Chrome extension
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    if (req.method === 'OPTIONS') return res.status(204).end();

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
          - Extract all artist/musician names from the title
          - Return ONLY valid JSON in this exact format: {"artists": ["Artist1", "Artist2"]}
          - Focus on music-related content (songs, interviews, performances, covers)
          - If the title is a remix, extract both the remixer and the original artist
          - Prioritize English names if an artist has names in multiple languages within the title
          - If no clear artists are identifiable, return {"artists": []}
          - Remove extra words like "Official", "Music Video", etc.
          - YouTube Music titles often format as 'Artist - Song Title' while YouTube might be 'Song Title by Artist'. Extract accordingly.
          
          Examples:
          "Jane Remover and Daft Punk Interview" → {"artists": ["Jane Remover", "Daft Punk"]}
          "Billie Eilish - Bad Guy (Official Music Video) ft. JPEGMAFIA" → {"artists": ["Billie Eilish", "JPEGMAFIA"]}
          "Radiohead and My Chemical Romance Live at Madison Square Garden" → {"artists": ["Radiohead", "My Chemical Romance"]}
          "How to play guitar" → {"artists": []}
          "Taylor Swift ft. Ed Sheeran - Song Title" → {"artists": ["Taylor Swift", "Ed Sheeran"]}
          "Daft Punk - Doin' It Right (Sewerslvt Remix)" → {"artists": ["Sewerslvt", "Daft Punk"]}`
        },
        {
          role: "user", 
          content: `Extract the artist names from this YouTube title: "${title}"`
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 100,   // Increased for JSON response
        });

        const response = completion.choices[0]?.message?.content?.trim();

        if (!response) {
            return res.status(200).json({artists: []});
        }

        try {
            // Parse the JSON response from OpenAI
            const parsed = JSON.parse(response);
            
            // Validate the response structure
            if (parsed && Array.isArray(parsed.artists)) {
                console.log(`[OpenAI] Extracted ${parsed.artists.length} artists from title: "${title}"`);
                res.status(200).json({ artists: parsed.artists });
            } else {
                console.log(`[OpenAI] Invalid response format: ${response}`);
                res.status(200).json({ artists: [] });
            }
        } catch (parseError) {
            console.error('[OpenAI] JSON parse error:', parseError, 'Response:', response);
        }

     } catch (error) {
        console.error('[OpenAI] Extract artists error:', error);
        res.status(500).json({ error: 'Failed to extract artist names' });
      }
}
