import { fetchArtist, fetchArtistFromName, extractArtistFromTitle}   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo  }     from './ytInfo.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const info   = await getYTInfo(tab.id);         // separate module
  var artist = info && await fetchArtist(info); // separate module
  if (!artist || artist.error) {
    console.log("could not find artist using channel ID, falling back to AI...") 
    const name = await extractArtistFromTitle(info.title);
    if (name) {
        artist = await fetchArtistFromName({channel: name});
    }
  }

  if (!artist || artist.error) {
    console.log("could not find artist using channel AI, falling back to Name...") 
    const scrape = await scrapeYTInfo(tab.id);
    artist = await fetchArtistFromName(scrape);
  }
  
  renderArtist(artist);                           // separate module
});