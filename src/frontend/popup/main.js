
import { renderArtists } from './multi-ui.js';
import { fetchMultipleArtists, fetchArtistsMediaSession } from './fetchArtists.js';



document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  
  // Check if we're on a YouTube page
  if (!tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
    const artists = await fetchArtistsMediaSession();
    renderArtists(artists); // Show "not on YouTube" message
    return;
  }

  const artists = await fetchMultipleArtists(tab.id);
  console.log("rendering multiple artists")
  renderArtists(artists);

});


  
  
