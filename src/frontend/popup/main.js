
import { renderArtists } from './multi-ui.js';
import { errorScreen } from './ui.js';
import { fetchMultipleArtists, fetchArtistsMediaSession } from '../../connections/fetchArtists.js';
import { isContentScriptReady } from '../../backend/browserInfo.js';
import { getCachedArtist } from '../../backend/client/cache.js';






document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  
  // Check if we're on a YouTube page

  if (!await isContentScriptReady(tab.id)) {
    errorScreen("notInjected");
    return;
  }

  if (!tab.url.includes('youtube.com/watch') && !tab.url.includes('music.youtube.com')) {
    const artists = await fetchArtistsMediaSession();
    if (artists.length > 0 && artists != "noMediaSession") {
      renderArtists(artists);
    }
    else {
      switch (artists) {
        case "noMediaSession": {
          errorScreen("noData");
          break;
        }
        case undefined: {
          console.log("[ERROR] no artist returned for mediaSession")
          errorScreen("noArtist");
          break;
        }
      }
    }// Show "not on YouTube" message
    return;
  }

  

  const artists = await fetchMultipleArtists(tab.id);
  console.log("rendering multiple artists")
  console.log(artists);
  if (artists.length > 0) {
    renderArtists(artists);
  }
  else {
    console.log("[ERROR] no artists detected, showing error")
    errorScreen("noArtist");
  }

});


  
  
