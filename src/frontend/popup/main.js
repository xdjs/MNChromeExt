import { fetchArtist }   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo }     from './ytInfo.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  const info   = await getYTInfo(tab.id);         // separate module
  var artist = info && await fetchArtist(info); // separate module
  if (!artist) {
    console.log("could not find artist using channel ID, switching to Name...") 
    const scrape = await scrapeYTInfo(tab.id);
    artist = info && await fetchArtist(scrape.channel);
  }
  
  renderArtist(artist);                           // separate module
});