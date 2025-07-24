import { fetchArtist, fetchArtistFromName, extractArtistFromTitle}   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo  }     from './ytInfo.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  
  // Check if we're on a YouTube page
  if (!tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
    renderArtist(null); // Show "not on YouTube" message
    return;
  }
  
  const info = await getYTInfo(tab.id);
  var artist = info && await fetchArtist(info);
  
  if (!artist || artist.error) {
    console.log("could not find artist using channel ID, falling back to AI...") 
    // Check if info and info.title exist before using
    if (info && info.title) {
      const name = await extractArtistFromTitle(info.title);
      if (name) {
        artist = await fetchArtistFromName({channel: name});
      }
    }
  }

  if (!artist || artist.error) {
    console.log("could not find artist using channel AI, falling back to Name...") 
    const scrape = await scrapeYTInfo(tab.id);
    if (scrape) {
      artist = await fetchArtistFromName(scrape);
    }
  }
  
  renderArtist(artist);
});