import { preLoad } from "../../connections/preLoad.js";
import { artists } from "../server/db/schema.js";


function isExtensionValid() {
    try {
        chrome.runtime.id;
        return true;
    } catch {
        return false;
    }
}

export function detectMediaSession() {
    if (!('mediaSession' in navigator)) {
        console.log('Media Session API not supported');
        return null;
    }

    const data = navigator.mediaSession.metadata;
    const playbackState = navigator.mediaSession.playbackState;


    // Be less strict - check for any metadata, not just playing state
    if (playbackState === 'paused') {
        return null;
    }

    // Allow any playback state, not just 'playing'
    if (!data) {
        console.log('No useful media session data (no title or artist)');
        return null;
    }

    return {
        title: data.title || '',
        channel: data.artist || '', // Fixed: was 'channel'
        album: data.album || '',
        source: 'mediaSession',
        playbackState: playbackState,
        url: window.location.href,
        domain: window.location.hostname
    };
}


export function watchForMediaSession() {
    if (!('mediaSession' in navigator)) return;

    let lastMetaData = null;

    const checkMediaSession = () => {
        if (isExtensionValid) {
            const data = navigator.mediaSession.metadata;
            const state = navigator.mediaSession.playbackState;
            if (JSON.stringify(data) != JSON.stringify(lastMetaData) && state == 'playing') {
                lastMetaData = JSON.stringify(data);
    
                chrome.runtime.sendMessage({
                    action: 'musicDetected',
    
                    data: detectMediaSession()
                });
    
                preLoad();
            }
            else {
                lastMetaData = JSON.stringify(data);
                chrome.runtime.sendMessage({
                    action: 'musicPaused',
    
                    data: detectMediaSession()
                });
            }
        }
        

    };
    
    setInterval(checkMediaSession, 3000);
}

