export function getVideoId(url: string): string | null {
    const patterns = [
        /v=([^&]+)/,
        /youtu\.be\/([^?&]+)/,
        /embed\/([^?&]+)/,
        /music\.youtube\.com\/watch\?v=([^&]+)/, // YouTube Music: ?v=ABC123
    ];
    for (const re of patterns) {
        const match = url.match(re);
        if (match) {
            console.log(match[1]);
            return match[1];
            
        }
    }
    return null;
}