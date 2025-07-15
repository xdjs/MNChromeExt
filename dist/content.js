"use strict";
(() => {
  // src/backend/linkExtractors.ts
  function getVideoId(url) {
    const patterns = [
      /v=([^&]+)/,
      /youtu\.be\/([^?&]+)/,
      /embed\/([^?&]+)/
    ];
    for (const re of patterns) {
      const match = url.match(re);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  // src/backend/server/youtubeQueries.ts
  var API_KEY = "AIzaSyByzNFPU1XR0gm_kfd2EoThjYlVeezmup8";
  async function fetchYTInfo(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items?.length) {
      return null;
    }
    const snip = data.items[0].snippet;
    return {
      title: snip.title,
      channel: snip.channelTitle,
      description: snip.description,
      tags: snip.tags
    };
  }

  // src/connections/listener.ts
  console.log("[YT-EXT] content script injected");
  chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === "GET_YT_INFO") {
      const videoId = getVideoId(location.href);
      if (!videoId) {
        sendResponse(null);
        return true;
      }
      fetchYTInfo(videoId).then((info) => sendResponse(info)).catch((err) => {
        console.error("[YT-EXT] Fetch error", err);
        sendResponse(null);
      });
    }
    return true;
  });
})();
