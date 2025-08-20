import { detectMediaSession } from '../backend/client/watchMediaSession.js';
import { getCachedMediaSessionResult, cacheMediaSessionResult, getCachedVideoResult, cacheVideoResult } from '../backend/client/cache.js';
import { fetchArtistFromName, extractMultipleArtistsFromTitle, fetchMultipleArtistsByNames} from './backendConnections.js';
import { hasCollaborationKeywords } from '../backend/client/hasCollabKeywords.js';
import { getVideoId } from '../backend/client/getVideoId.js';
import { fetchYTInfo } from '../backend/server/youtubeQueries.js';
import { fetchArtist } from './backendConnections.js';

export async function preLoadMediaSession() {
    console.log("preloading...")
    
    try {
        // Get media session data directly (we're already in content script context)
        const mediaData = detectMediaSession();
        
        if (!mediaData || !mediaData.title) {
            console.log('No media session data to preload');
            return;
        }

        // Check cache first using existing function
        const cached = await getCachedMediaSessionResult(mediaData);
        if (cached) {
            console.log("Preload: cached result already exists: " + cached);
            return;
        }

        let artists = [];
        
        // Try to get artist by name first (reusing existing logic from fetchArtistsMediaSession)
        if (mediaData.title) {
            const artist = await fetchArtistFromName(mediaData);
            if (artist && !artist.error && artist.id) {
                artists.push({...artist, isPrimary: true});
            
                // Check for collaborations using existing function
                if (hasCollaborationKeywords(mediaData.title)) {
                    const allArtistNames = await extractMultipleArtistsFromTitle(mediaData);
                    const newNames = allArtistNames.filter(name =>
                        name.toLowerCase() !== artist.name.toLowerCase()
                    );
        
                    if (newNames.length > 0) {
                        const newArtists = await fetchMultipleArtistsByNames(newNames);
                        const validArtists = newArtists
                            .filter(artist => artist && !artist.error && artist.id)
                            .map(artist => ({...artist, isPrimary: false}));
                        
                        artists.push(...validArtists);
                    }
                }   
                
                // If we found artists, cache and return
                if (artists.length > 0) {
                    await cacheMediaSessionResult(mediaData, artists);
                    console.log('Successfully preloaded and cached artist data via name lookup');
                    return artists;
                }
            }
        }

        // Fallback to AI extraction if no artists found by name (reusing existing logic)
        if (mediaData.title && artists.length === 0) {
            console.log("Preload: falling back to AI extraction")
            const artistNames = await extractMultipleArtistsFromTitle(mediaData);
            console.log('AI extracted names:', artistNames);
            
            if (artistNames.length > 0) {
                const foundArtists = await fetchMultipleArtistsByNames(artistNames);
                const validArtists = foundArtists
                    .filter(artist => artist && !artist.error && artist.id)
                    .map(artist => ({ ...artist, isPrimary: false }));
                
                artists.push(...validArtists);
                
                // Cache results using existing function
                
            }
            await cacheMediaSessionResult(mediaData, artists);
        }
        
        return artists;
        
    } catch (error) {
        console.error('Preload error:', error);
        return [];
    }
}

export async function preLoadYT() {
    const videoId = getVideoId(window.location.href);
    if (!videoId) return;

    const cached = await getCachedVideoResult(videoId);
    if (cached) return;

    const info = await fetchYTInfo(videoId);
    if (!info) return;

    let artists = [];

    const artist = await fetchArtist({
        id: info.id,
        title: info.title,
        channel: info.channel
    })
    if (artist && !artist.error) {
        artists.push({...artist, isPrimary: true});

        if (hasCollaborationKeywords(info.title)) {
            console.log("[preload] using AI for collaborators")
            const allArtistNames = await extractMultipleArtistsFromTitle(info);
            const newNames = allArtistNames.filter(name =>
                name.toLowerCase() !== artist.name.toLowerCase()
            );

            if (newNames.length > 0) {
                const newArtists = await fetchMultipleArtistsByNames(newNames);
                const validArtists = newArtists
                    .filter(artist => artist && !artist.error && artist.id)
                    .map(artist => ({...artist, isPrimary: false}));
                
                artists.push(...validArtists);
            }
        }
    }
    // Fallback to AI if no artists found
    if (artists.length === 0 && info.title) {
        console.log("[Preload] falling back to AI")
        const artistNames = await extractMultipleArtistsFromTitle(info);
        if (artistNames.length > 0) {
            const foundArtists = await fetchMultipleArtistsByNames(artistNames);
            const validArtists = foundArtists
                .filter(artist => artist && !artist.error && artist.id)
                .map(artist => ({ ...artist, isPrimary: false }));
            
            artists.push(...validArtists);
        }
    }
    
    // Cache results
    if (artists.length > 0) {
        
        console.log('Successfully preloaded YouTube data');
    }

    await cacheVideoResult(videoId, artists);
    
    return artists;
}

export async function preLoad() {
    

    try {
        // Try YouTube first (more specific)
        const videoId = getVideoId(window.location.href);
        if (videoId) {
            console.log("preloading youtube");
            return await preLoadYT(videoId);
        }
        
        // Fallback to media session
        const mediaData = detectMediaSession();
        if (mediaData && mediaData.title) {
            console.log("preloading media session");
            return await preLoadMediaSession(mediaData);
        }
        
        console.log('No preloadable content found');
        return [];
        
    } catch (error) {
        console.error('Preload error:', error);
        return [];
    }
}