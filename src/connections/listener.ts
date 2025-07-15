import { getYTInfo } from "../backend/pageScraper";

console.log('[YT-EXT] content script injected');

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === 'GET_YT_INFO') {
        sendResponse(typeof getYTInfo === 'function' ? getYTInfo() : null);
    }
});

/* ----------------- Option A: MutationObserver ----------------- */
(function watchForTitle() {
    if (trySend()) return;                       // succeed early
  
    const obs = new MutationObserver(() => {
      if (trySend()) obs.disconnect();           // stop after success
    });
    obs.observe(document, { childList: true, subtree: true });
  
    function trySend(): boolean {
      const info = getYTInfo();
      if (info && info.videoTitle.trim().length) {
        chrome.runtime.sendMessage({ type: 'VIDEO_INFO', payload: info });
        return true;
      }
      return false;
    }
  })();