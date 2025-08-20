import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle, fetchMultipleArtistsByNames}   from './backendConnections.js';
import { getYTInfo, getMediaSessionInfo  }     from '../backend/client/getBrowserInfo.js';
import { hasCollaborationKeywords } from '../backend/client/hasCollabKeywords.js';
import { cacheVideoResult, getCachedVideoResult, cacheArtist, getCachedArtist, getCachedMediaSessionResult, cacheMediaSessionResult } from '../backend/client/cache.js';

// Helper function to extract video ID from URL
function getVideoIdFromUrl(url) {
    const patterns = [
        /v=([^&]+)/,
        /youtu\.be\/([^?&]+)/,
        /music\.youtube\.com\/watch\?v=([^&]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export async function fetchMultipleArtists(tabId) {
    // First check for cached video result using tab URL
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let videoId = null;
    if (tab?.url) {
        videoId = getVideoIdFromUrl(tab.url);
        if (videoId) {
            const cached = await getCachedVideoResult(videoId);
            if (cached) {
                console.log('Returning cached video result for:', videoId);
                return cached;
            }
        }
    }

    const info = await getYTInfo(tabId);
    let artists = [];
  
    if (info?.id) {
      console.log("[DEBUG] " + info.id);
      const artist = await fetchArtist(info);
      if (artist.id) {
          artists.push({...artist, isPrimary: true});

          console.log("[DEBUG] Youtube lookup successful: " + artists);
      
          if (hasCollaborationKeywords(info.title)) {
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
          
          // Only return early if we found at least one artist

          if (artists.length > 0) {
              if (videoId) {
                await cacheVideoResult(videoId, artists);
              }
              return artists;
          }
      }
    }
  if (!info?.title || artists.length === 0) {
    console.log("falling back to AI")
    const artistNames = await extractMultipleArtistsFromTitle(info);
    console.log(artistNames);
    
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      
      if (!foundArtists) {
        return null;
      }
      
      const validArtists = foundArtists
        .filter(artist => artist && !artist.error && artist.id)
        .map(artist => ({ ...artist, isPrimary: false }));
      
      
      artists.push(...validArtists);
    }
  }
  
  // Note: Can't use DOM scraping fallback for media session since we don't have tabId
  if (videoId) {
    await cacheVideoResult(videoId, artists);
  }
  return artists;
  }
  
export async function fetchArtistsMediaSession() {
  const info = await getMediaSessionInfo();
  console.log('Media session info:', info); // Debug log
  
  
  if (!info) {
    console.log('No media session data available');
    return "noMediaSession";
  }

  const cached = await getCachedMediaSessionResult(info);
  if (cached) {
    console.log("cached result found, returning...") ;
    return cached;
  }

  let artists = [];
  
    const artistNames = await extractMultipleArtistsFromTitle(info);
    console.log(artistNames);
    
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      const validArtists = foundArtists
        .filter(artist => artist && !artist.error && artist.id)
        .map(artist => ({ ...artist, isPrimary: false }));
      
      artists.push(...validArtists);

      cacheMediaSessionResult(info, artists);
    }
  console.log("returning artists...")
  
  return artists;
  
}
