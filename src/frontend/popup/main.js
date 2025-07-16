import { fetchArtist, fetchArtistFromName}   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo }     from './ytInfo.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const info   = await getYTInfo(tab.id);         // separate module
  var artist = info && await fetchArtist(info); // separate module
  if (!artist || artist.error) {
    console.log("could not find artist using channel ID, falling back to Name...") 
    const scrape = await scrapeYTInfo(tab.id);
    console.log(`Scrape: ${scrape.channel}`);
    artist = info && await fetchArtistFromName(scrape);
    console.log(`Scrape: ${artist}`);
  }
  
  renderArtist(artist);                           // separate module
});