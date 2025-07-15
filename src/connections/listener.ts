import { getVideoId } from "../backend/linkExtractors.js";
import { fetchYTInfo } from "../backend/server/youtubeQueries.js";


console.log('[YT-EXT] content script injected');

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