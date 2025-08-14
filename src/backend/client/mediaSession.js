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


export async function watchForMediaSession() {
    if (window.__mn_watch_started) return;
    window.__mn_watch_started = true;
    if (!('mediaSession' in navigator)) return;

    let lastMetaData = null;
    let lastSignature = null;

    const checkMediaSession = () => {
        if (isExtensionValid()) {
            const data = navigator.mediaSession.metadata;
            const state = navigator.mediaSession.playbackState;
            const signature = JSON.stringify({
                title: data?.title || '',
                artist: data?.artist || '',
                album: data?.album || ''
            });
            const hasChanged = signature !== lastSignature;
            if (hasChanged && state === 'playing') {
                lastMetaData = JSON.stringify(data);
                lastSignature = signature;

                // simple throttle: avoid calling preLoad too frequently
                const now = Date.now();
                if (window.__mn_last_preload_ts && now - window.__mn_last_preload_ts < 4000) {
                    return;
                }
                window.__mn_last_preload_ts = now;
    
                chrome.runtime.sendMessage({
                    action: 'musicDetected',
    
                    data: detectMediaSession()
                });
    
                preLoad();
            }
            else {
                lastMetaData = JSON.stringify(data);
                lastSignature = signature;
            }
        }
        

    };
    
    setInterval(checkMediaSession, 3000);
}

