"use strict";
(() => {
  // src/backend/linkExtractors.ts
  function getVideoId(url) {
    const patterns = [
      /v=([^&]+)/,
      /youtu\.be\/([^?&]+)/,
      /embed\/([^?&]+)/,
      /music\.youtube\.com\/watch\?v=([^&]+)/
      // YouTube Music: ?v=ABC123
    ];
    for (const re of patterns) {
      const match = url.match(re);
      if (match) {
        console.log(match[1]);
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
    console.log(snip.channelId);
    return {
      title: snip.title,
      channel: snip.channelTitle,
      description: snip.description,
      tags: snip.tags,
      id: snip.channelId
    };
  }

  // src/backend/pageScraper.ts
  function scrapeYTInfo() {
    let title;
    let channelName;
    if (location.hostname === "music.youtube.com") {
      title = document.querySelector(".title.ytmusic-player-bar");
      channelName = document.querySelector(".byline.ytmusic-player-bar a");
    } else {
      title = document.querySelector("h1.title yt-formatted-string") || document.querySelector("ytd-watch-metadata h1");
      channelName = document.querySelector("#owner-name a") || document.querySelector("ytd-channel-name#channel-name a");
    }
    const ytDescription = document.querySelector("#description");
    const ytUsername = document.querySelector('a.yt-simple-endpoint.style-scope.yt-formatted-string[href^="/@"]');
    console.log("[YT-EXT] titleEl", title, "channelEl", channelName);
    if (title) {
      console.log("Title: ", title.textContent.trim());
    }
    if (channelName) {
      console.log("Channel: ", channelName.textContent.trim());
    }
    if (channelName && title && ytDescription) {
      console.log(ytUsername?.textContent?.trim());
      return {
        videoTitle: title.textContent.trim(),
        channel: channelName.textContent.trim(),
        description: ytDescription?.textContent.trim(),
        username: ytUsername?.textContent.trim()
      };
    }
    console.log("no info found");
    return null;
  }

  // src/backend/mediaSession.ts
  function detectMediaSession() {
    if (!("mediaSession" in navigator)) {
      console.log("Media Session API not supported");
      return null;
    }
    const data = navigator.mediaSession.metadata;
    const playbackState = navigator.mediaSession.playbackState;
    console.log("Media Session Debug:", {
      metadata: data,
      playbackState,
      hasMetadata: !!data,
      url: window.location.href
    });
    if (playbackState === "paused") {
      return null;
    }
    if (!data) {
      console.log("No useful media session data (no title or artist)");
      return null;
    }
    return {
      title: data.title || "",
      channel: data.artist || "",
      // Fixed: was 'channel'
      album: data.album || "",
      source: "mediaSession",
      playbackState,
      url: window.location.href,
      domain: window.location.hostname
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
    if (req.type === "SCRAPE_YT_INFO") {
      sendResponse(scrapeYTInfo());
    }
    return true;
  });
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkMediaSession") {
      sendResponse(detectMediaSession());
    }
  });
})();
//# sourceMappingURL=content.js.map
