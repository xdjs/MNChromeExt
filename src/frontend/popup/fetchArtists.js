import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle, fetchMultipleArtistsByNames}   from './api.js';
import { getYTInfo, scrapeYTInfo, getMediaSessionInfo  }     from './browserInfo.js';
import { hasCollaborationKeywords } from './collabs.js';

export async function fetchMultipleArtists(tabId) {
    const info = await getYTInfo(tabId);
    let artists = [];
  
    if (info?.id) {
      const artist = await fetchArtist(info);
      if (artist && !artist.error && artist.id) {
          artists.push({...artist, isPrimary: true});
      
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
              return artists;
          }
      }
    }
  if (info?.title || artists.length === 0) {
    console.log("falling back to AI")
    const artistNames = await extractMultipleArtistsFromTitle(info);
    console.log(artistNames);
    
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      const validArtists = foundArtists
        .filter(artist => artist && !artist.error && artist.id)
        .map(artist => ({ ...artist, isPrimary: false }));
      
      artists.push(...validArtists);
    }
  }
  
  // Note: Can't use DOM scraping fallback for media session since we don't have tabId
  
  return artists;
  }
  
export async function fetchArtistsMediaSession() {
  const info = await getMediaSessionInfo();
  console.log('Media session info:', info); // Debug log
  let artists = [];
  
  if (!info) {
    console.log('No media session data available');
    return artists;
  }
  
  if (info?.title) {
      const artist = await fetchArtistFromName(info);
      if (artist && !artist.error && artist.id) {
          artists.push({...artist, isPrimary: true});
      
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
              return artists;
          }
      }
    }
  if (info?.title && artists.length === 0) {
    console.log("falling back to AI")
    const artistNames = await extractMultipleArtistsFromTitle(info);
    console.log(artistNames);
    
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      const validArtists = foundArtists
        .filter(artist => artist && !artist.error && artist.id)
        .map(artist => ({ ...artist, isPrimary: false }));
      
      artists.push(...validArtists);
    }
  }
  
  return artists;
  
}
