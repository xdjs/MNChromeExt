import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle}   from './api.js';
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
  
              const newArtists = await Promise.all (
                  newNames.map(async name => {
                      const artist = await fetchArtistFromName({channel: name});
                      return artist && !artist.error ? {...artist, isPrimary: false } : null;
                  })
              );
  
              artists.push(...newArtists.filter(Boolean));
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
    const foundArtists = await Promise.all(
      artistNames.map(async name => {
        const artist = await fetchArtistFromName({channel: name});
        return artist && !artist.error ? { ...artist, isPrimary: false } : null;
      })
    );
    artists.push(...foundArtists.filter(Boolean));
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
  
  
