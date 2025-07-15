

export interface youTubeInfo {
    videoTitle: String;
    channel: String;
    description: String;
}


export function getYTInfo(): youTubeInfo | null {
    // Fallback selectors for both old and new YouTube layouts
    const title = document.querySelector('h1.title yt-formatted-string')
        || document.querySelector('ytd-watch-metadata h1');

    const channelName = document.querySelector('#owner-name a')
        || document.querySelector('ytd-channel-name#channel-name a');

    const ytDescription = document.querySelector('#description');

    console.log('[YT-EXT] titleEl', title, 'channelEl', channelName);

    if (title) {
        console.log('Title: ', title.textContent!.trim());
    }

    if (channelName) {
        console.log('Channel: ', channelName.textContent!.trim());
    }
    if (channelName && title && ytDescription) {
        return {
            videoTitle: title.textContent!.trim(),
            channel: channelName.textContent!.trim(),
            description: ytDescription?.textContent!.trim()
        }
    }
    console.log('no info found');
    return null;
    
}