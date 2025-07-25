
import { renderArtists } from './multi-ui.js';
import { fetchMultipleArtists } from './fetchArtists.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  
  // Check if we're on a YouTube page
  if (!tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
    renderArtists([]); // Show "not on YouTube" message
    return;
  }

  const artists = await fetchMultipleArtists(tab.id);
  renderArtists(artists);

});


  
  
