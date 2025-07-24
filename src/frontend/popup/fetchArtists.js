import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle}   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo  }     from './ytInfo.js';
import { hasCollaborationKeywords } from './collabs.js';
import { channel } from 'diagnostics_channel';

export async function fetchMultipleArtists(tabId) {
    const info = await getYTInfo(tab.id);
    let artists = [];
  
    if (info.id) {
      const artist = await fetchArtist(info);
      if (!artist.error) {
          artists.push({...artist, isPrimary: true});
      }
      
      if (hasCollaborationKeywords(info.title)) {
          const allArtistNames = await extractMultipleArtistsFromTitle(info.title);
          const newNames = allArtistNames.filter(name =>
              name.toLowerCase() !== primaryArtist.name.toLowerCase()
          );
  
          const newArtists = await Promise.all (
              newNames.map(async name => {
                  const artist = await fetchArtistFromName({channel: name});
                  return artist && !artist.error ? {...artist, isPrimary: false } : null;
              })
          );
  
          artists.push(...newArtists.filter(Boolean));
      }   
      return artists;
  
    }
    // Step 3: Fallback - no channel match, try multi-artist extraction
  if (info?.title) {
    const artistNames = await extractMultipleArtistsFromTitle(info.title);
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
  
  
