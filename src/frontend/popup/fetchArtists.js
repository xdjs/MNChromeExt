import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle, fetchMultipleArtistsByNames}   from './api.js';
import { getYTInfo, scrapeYTInfo  }     from './ytInfo.js';
import { hasCollaborationKeywords } from './collabs.js';

export async function fetchMultipleArtists(tabId) {
    const info = await getYTInfo(tabId);
    let artists = [];
  
    if (info?.id) {
      const artist = await fetchArtist(info);
      if (artist && !artist.error && artist.id) {
          artists.push({...artist, isPrimary: true});
      
          if (hasCollaborationKeywords(info.title)) {
              const allArtistNames = await extractMultipleArtistsFromTitle(info.title);
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
    // Step 3: Fallback - no channel match, try multi-artist extraction
  if (info?.title || artists.length === 0) {
    console.log("falling back to AI")
    const artistNames = await extractMultipleArtistsFromTitle(info.title);
    console.log(artistNames);
    
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      const validArtists = foundArtists
        .filter(artist => artist && !artist.error && artist.id)
        .map(artist => ({ ...artist, isPrimary: false }));
      
      artists.push(...validArtists);
    }
  }
  
  // Step 4: Final fallback to DOM scraping (single artist)
  if (artists.length === 0) {
    const scrape = await scrapeYTInfo(tabId);
    if (scrape) {
      const artist = await fetchArtistFromName(scrape);
      if (artist && !artist.error) {
        artists.push({ ...artist, isPrimary: true });
      }
    }
  }
  
  return artists;
  }
  
  
