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

    const {title, data} = req.body as {title?: string, data?: any};
    
    // Support both legacy title-only calls and new data object calls
    const inputData = data || (title ? {title} : null);
    const extractionTitle = inputData?.title || inputData?.videoTitle || title;
    
    if (!extractionTitle) {
        return res.status(400).json({error: 'Missing title or data'})
    }

    try {
        const completion = await openAI.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective for simple extraction
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting the primary artist name from YouTube video titles and related data. 
          
          Rules:
          - Extract the main/primary artist/musician name from the provided data
          - Use ALL available context: title, description, channel name, tags, album info, etc.
          - Channel names can indicate official artist accounts (e.g., "Taylor Swift" channel likely means Taylor Swift content)
          - Descriptions often contain credits and additional context
          - Focus on music-related content (songs, interviews, performances, covers)
          - Return only the artist name, nothing else
          - If multiple artists are present, return the main/primary one (usually first mentioned or channel owner)
          - If the title is a remix, prioritize the remixer over the original track author
          - If no clear artist is identifiable, return "null"
          - Remove extra words like "Official", "Music Video", "Records", "Entertainment", etc.
          - YouTube Music titles often format as 'Artist - Song Title' while YouTube might be 'Song Title by Artist'
          - Consider channel context: if channel is "Arctic Monkeys" and title is "Do I Wanna Know?", artist is clearly "Arctic Monkeys"
          
          Examples:
          "Jane Remover Interview" → "Jane Remover"
          "Bad Guy" on "Billie Eilish" channel → "Billie Eilish"  
          "Radiohead Live at Madison Square Garden" → "Radiohead"
          "How to play guitar" → "null"
          "Taylor Swift ft. Ed Sheeran - Song Title" → "Taylor Swift"
          "Daft Punk - Doin' It Right (Sewerslvt Remix)" → "Sewerslvt"`
        },
        {
          role: "user", 
          content: `Extract the primary artist name from this YouTube data: ${JSON.stringify(inputData, null, 2)}`
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 50,   // Short response expected
        });

        const name = completion.choices[0]?.message?.content?.trim();

        if (!name) {
            return res.status(200).json({artist:null});
        }

        console.log(`[OpenAI] Extracted "${name}" from data: "${extractionTitle}"`);
        res.status(200).json({ artist: name });
     } catch (error) {
        console.error('[OpenAI] Extract artist error:', error);
        res.status(500).json({ error: 'Failed to extract artist name' });
      }
}