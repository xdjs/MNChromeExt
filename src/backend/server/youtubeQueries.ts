// NOTE: API key is inlined at build time by esbuild define
const API_KEY = process.env.YT_API_KEY as string;

export interface YTinfo {
    title: string;
    channel: string;
    description: string;
    tags: string[];
}

export async function fetchYTInfo(videoId: string): Promise<YTinfo | null> {
    const url = `https://www.googleapis.com/youtube/v3/videos?` +
                `part=snippet&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) {
        return null;
    }

    const snip = data.items[0].snippet;
    return {
        title: snip.title,
        channel: snip.channelTitle,
        description: snip.description,
        tags: snip.tags
    };
}