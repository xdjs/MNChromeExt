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
          content: `You are an expert at extracting artist names from YouTube video titles and related data. 
          
            Rules:
            - Extract all artist/musician names from the provided data
            - Use ALL available context: title, description, channel name, tags, album info, etc.
            - Channel names can indicate official artist accounts (e.g., "Taylor Swift" channel likely means Taylor Swift content)
            - Descriptions often contain credits, collaborations, and additional artist information
            - Tags can provide genre context and additional artist names
            - Return ONLY valid JSON in this exact format: {"artists": ["Artist1", "Artist2"]}
            - Focus on music-related content (songs, interviews, performances, covers)
            - If the data indicates the video is NOT music related but description contains song credits, extract those artists
            - If the title is a remix, extract both the remixer and the original artist
            - Prioritize English names if an artist has names in multiple languages
            - If no clear artists are identifiable, return {"artists": []}
            - Remove extra words like "Official", "Music Video", "Records", "Entertainment", etc.
            - YouTube Music titles often format as 'Artist - Song Title' while YouTube might be 'Song Title by Artist'
            - Consider channel context: if channel is "Arctic Monkeys" and title is "Do I Wanna Know?", artist is clearly "Arctic Monkeys"
          
          Examples:
          "Jane Remover and Daft Punk Interview" → {"artists": ["Jane Remover", "Daft Punk"]}
          "Bad Guy" on "Billie Eilish" channel → {"artists": ["Billie Eilish"]}
          "Collaboration video" with description "Featuring Tyler, The Creator and Frank Ocean" → {"artists": ["Tyler, The Creator", "Frank Ocean"]}
          "How to play guitar" → {"artists": []}
          "Daft Punk - Doin' It Right (Sewerslvt Remix)" → {"artists": ["Sewerslvt", "Daft Punk"]}`
        },
        {
          role: "user", 
          content: `Extract the artist names from this YouTube data: ${JSON.stringify(inputData, null, 2)}`
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
                console.log(`[OpenAI] Extracted ${parsed.artists.length} artists from data: "${extractionTitle}"`);
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
