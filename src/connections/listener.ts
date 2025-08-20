// @ts-ignore -- JS file without type declarations
import { getVideoId } from "../backend/client/getVideoId.js";
import { fetchYTInfo } from "../backend/server/youtubeQueries.js";
// @ts-ignore -- compiled file provides the export
import { scrapeYTInfo } from "../backend/client/pageScraper.js";
// @ts-ignore -- JS file without type declarations
import { detectMediaSession, watchForMediaSession } from "../backend/client/watchMediaSession.js";


console.log('[YT-EXT] content script injected');

// Start watching for media session changes
watchForMediaSession();

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === 'GET_YT_INFO') {
    const videoId = getVideoId(location.href);
    if (!videoId) {
      sendResponse(null);
      return true;
    }

    fetchYTInfo(videoId)
      .then((info) => sendResponse(info))
      .catch((err) => {
        console.error('[YT-EXT] Fetch error', err);
        sendResponse(null);
      });
  }
  return true; // keep the messaging channel open
});

// Listen for requests from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkMediaSession') {
    sendResponse(detectMediaSession());
  }
});

