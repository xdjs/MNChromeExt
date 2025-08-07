

export interface youTubeInfo {
    videoTitle: String;
    channel: String;
    description: String;
    username?: String;
}


export function scrapeYTInfo(): youTubeInfo | null {
    // Fallback selectors for both old and new YouTube layouts
    
    let title: Element | null;

    let channelName: Element | null;

    if (location.hostname === 'music.youtube.com') {
        // YouTube Music selectors
        title = document.querySelector('.title.ytmusic-player-bar');
        channelName = document.querySelector('.byline.ytmusic-player-bar a');
    // ... YouTube Music specific DOM selectors
    }

    else {
        title = document.querySelector('h1.title yt-formatted-string')
        || document.querySelector('ytd-watch-metadata h1');

        channelName = document.querySelector('#owner-name a')
        || document.querySelector('ytd-channel-name#channel-name a');
    }
    

    const ytDescription = document.querySelector('#description');

    const ytUsername = document.querySelector<HTMLAnchorElement>('a.yt-simple-endpoint.style-scope.yt-formatted-string[href^="/@"]');

    console.log('[YT-EXT] titleEl', title, 'channelEl', channelName);

    if (title) {
        console.log('Title: ', title.textContent!.trim());
    }

    if (channelName) {
        console.log('Channel: ', channelName.textContent!.trim());
    }
    if (channelName && title && ytDescription) {
        console.log(ytUsername?.textContent?.trim());
        return {
            videoTitle: title.textContent!.trim(),
            channel: channelName.textContent!.trim(),
            description: ytDescription?.textContent!.trim(),
            username: ytUsername?.textContent!.trim()
        }
    }
    console.log('no info found');
    return null;
    
}