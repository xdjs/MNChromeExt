export function getVideoId(url: string): string | null {
    const patterns = [
        /v=([^&]+)/,
        /youtu\.be\/([^?&]+)/,
        /embed\/([^?&]+)/,
    ];
    for (const re of patterns) {
        const match = url.match(re);
        if (match) {
            return match[1];
        }
    }
    return null;
}