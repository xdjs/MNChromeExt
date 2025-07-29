import { artists } from "./server/db/schema.js";

export function detectMediaSession() {
    if (!('mediaSession' in navigator)) {
        console.log('Media Session API not supported');
        return null;
    }

    const data = navigator.mediaSession.metadata;
    const playbackState = navigator.mediaSession.playbackState;
    
    console.log('Media Session Debug:', {
        metadata: data,
        playbackState: playbackState,
        hasMetadata: !!data,
        url: window.location.href
    });

    // Be less strict - check for any metadata, not just playing state
    if (!data) {
        console.log('No media session metadata available');
        return null;
    }

    // Allow any playback state, not just 'playing'
    if (!data.title && !data.artist) {
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


