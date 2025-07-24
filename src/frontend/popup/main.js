import { fetchArtist, fetchArtistFromName, extractArtistFromTitle, extractMultipleArtistsFromTitle}   from './api.js';
import { renderArtist }  from './ui.js';
import { getYTInfo, scrapeYTInfo  }     from './ytInfo.js';
import { hasCollaborationKeywords } from './collabs.js';
import { channel } from 'diagnostics_channel';
import { fetchMultipleArtists } from './fetchArtists.js';


document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  
  // Check if we're on a YouTube page
  if (!tab.url.includes('youtube.com') && !tab.url.includes('music.youtube.com')) {
    renderArtist([]); // Show "not on YouTube" message
    return;
  }

  const artists = await fetchMultipleArtists(tab.id);
  renderArtists(artists);

});


  
  
