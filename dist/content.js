"use strict";
(() => {
  // src/backend/pageScraper.ts
  function getYTInfo() {
    const title = document.querySelector("h1.title yt-formatted-string") || document.querySelector("ytd-watch-metadata h1");
    const channelName = document.querySelector("#owner-name a") || document.querySelector("ytd-channel-name#channel-name a");
    const ytDescription = document.querySelector("#description");
    console.log("[YT-EXT] titleEl", title, "channelEl", channelName);
    if (title) {
      console.log("Title: ", title.textContent.trim());
    }
    if (channelName) {
      console.log("Channel: ", channelName.textContent.trim());
    }
    if (channelName && title && ytDescription) {
      return {
        videoTitle: title.textContent.trim(),
        channel: channelName.textContent.trim(),
        description: ytDescription?.textContent.trim()
      };
    }
    console.log("no info found");
    return null;
  }

  // src/connections/listener.ts
  console.log("[YT-EXT] content script injected");
  chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === "GET_YT_INFO") {
      sendResponse(typeof getYTInfo === "function" ? getYTInfo() : null);
    }
  });
  (function watchForTitle() {
    if (trySend()) return;
    const obs = new MutationObserver(() => {
      if (trySend()) obs.disconnect();
    });
    obs.observe(document, { childList: true, subtree: true });
    function trySend() {
      const info = getYTInfo();
      if (info && info.videoTitle.trim().length) {
        chrome.runtime.sendMessage({ type: "VIDEO_INFO", payload: info });
        return true;
      }
      return false;
    }
  })();
})();
