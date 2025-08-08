"use strict";
(() => {
  // src/frontend/popup/ui.js
  function renderArtist(a) {
    console.log(a);
    console.log(a.bio);
    const titleEl = document.getElementById("title");
    const bioEl = document.getElementById("bio");
    const linksTitleEl = document.getElementById("links-title");
    const linksListEl = document.getElementById("links-list");
    const musicNerdEl = document.getElementById("MN-link");
    musicNerdEl.textContent = document.createElement("a");
    if (a.id) {
      musicNerdEl.href = `https://www.musicnerd.xyz/artist/` + a.id;
    } else {
      musicNerdEl.href = `https://www.musicnerd.xyz`;
    }
    musicNerdEl.className = "flex items-center gap-3 hover:bg-gray-50 p-2 rounded";
    musicNerdEl.target = "_blank";
    const MNurl = document.createElement("p");
    MNurl.className = "text-sm text-gray-500 truncate";
    if (a.id) {
      MNurl.textContent = "View on MusicNerd.xyz";
    } else {
      MNurl.textContent = "Add them on MusicNerd.xyz";
    }
    musicNerdEl.appendChild(MNurl);
    titleEl.textContent = a.name ?? "Sorry, we don't know this artist!";
    bioEl.textContent = a.bio ?? "No bio Available";
    if (!a.id) {
      bioEl.textContent = "";
    }
    if (linksTitleEl) {
      if (a.id) {
        linksTitleEl.textContent = `${a.name ?? "Artist"}'s Links`;
        linksTitleEl.style.display = "block";
      } else {
        linksTitleEl.style.display = "none";
      }
    }
    if (linksListEl) {
      linksListEl.innerHTML = "";
      if (Array.isArray(a.links) && a.links.length > 0) {
        a.links.forEach((l) => {
          const li = document.createElement("li");
          const linkWrapper = document.createElement("a");
          linkWrapper.href = l.url ?? l.href ?? "#";
          linkWrapper.target = "_blank";
          linkWrapper.className = "flex items-center gap-3 hover:bg-gray-50 p-2 rounded";
          const label = document.createElement("p");
          label.className = "font-semibold uppercase text-sm text-blue-600 hover:text-blue-800";
          label.textContent = l.label ?? l.title ?? "Link";
          const url = document.createElement("p");
          url.className = "text-sm text-gray-500 truncate";
          if (l.platform_type_list && l.platform_type_list.includes("social")) {
            url.textContent = a[l.label] ?? l.url ?? l.href ?? "";
          } else {
            url.textContent = "";
          }
          const img = document.createElement("img");
          img.src = l.image;
          img.alt = "Artist Photo";
          img.className = "w-8 h-8 rounded-full object-cover flex-shrik-0";
          const textContainer = document.createElement("div");
          textContainer.className = "flex-1 min-w-0";
          textContainer.appendChild(label);
          textContainer.appendChild(url);
          linkWrapper.appendChild(img);
          linkWrapper.appendChild(textContainer);
          li.appendChild(linkWrapper);
          linksListEl.appendChild(li);
        });
      } else if (a.id) {
        const li = document.createElement("li");
        li.className = "text-gray-400 text-sm";
        li.textContent = "No links available";
        linksListEl.appendChild(li);
      } else {
        const li = document.createElement("li");
        li.className = "text-gray-400 text-sm";
        li.textContent = "";
        linksListEl.appendChild(li);
      }
    }
    console.log(titleEl);
    console.log(bioEl);
  }
  function errorScreen(error) {
    const titleEl = document.getElementById("title");
    const bioEl = document.getElementById("bio");
    switch (error) {
      case "noArtist": {
        titleEl.textContent = "Sorry, we don't know this artist!";
        bioEl.textContent = "If you'd like, you can add them on MusicNerd!";
        const musicNerdEl = document.getElementById("MN-link");
        musicNerdEl.textContent = document.createElement("a");
        musicNerdEl.className = "flex items-center gap-3 hover:bg-gray-50 p-2 rounded";
        musicNerdEl.target = "_blank";
        musicNerdEl.href = `https://www.musicnerd.xyz`;
        const MNurl = document.createElement("p");
        MNurl.className = "text-sm text-gray-500 truncate";
        MNurl.textContent = "Add them on MusicNerd.xyz";
        musicNerdEl.appendChild(MNurl);
        break;
      }
      case "noData": {
        titleEl.textContent = "We don't see anything playing!";
        bioEl.textContent = "Start playing something to get started!";
        break;
      }
      case "notInjected": {
        titleEl.textContent = "Our system isn't hooked up yet.";
        bioEl.textContent = "If you've just installed or reloaded the application, \n please restart your browser or reload the page.";
        break;
      }
      case "default": {
        titleEl.textContent = "An error has occured.";
        break;
      }
      default: {
        titleEl.textContent = "An error has occured.";
        break;
      }
    }
    console.log(titleEl);
    console.log(bioEl);
  }

  // src/frontend/popup/multi-ui.js
  var artistList = [];
  var activeArtistIndex = 0;
  function renderArtists(artists) {
    console.log("renderArtists called with:", artists);
    artistList = artists;
    if (artists.length === 1) {
      console.log("Single artist detected, using regular UI");
      hideArtistTabs();
      renderArtist(artists[0]);
      return;
    }
    console.log("Multiple artists detected, showing tabs");
    showArtistTabs(artists);
    renderActiveArtist();
  }
  function showArtistTabs(artists) {
    const tabsContainer = document.getElementById("artist-tabs");
    const tabsList = document.getElementById("tabs-list");
    tabsList.innerHTML = "";
    artists.forEach((artist, index) => {
      const tab = document.createElement("button");
      tab.className = `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${index === activeArtistIndex ? "border-blue-500 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`;
      const displayName = artist.name || "Unknown artist";
      tab.textContent = artist.isPrimary ? `${displayName} \u2B50` : displayName;
      tab.addEventListener("click", () => switchToArtist(index));
      tabsList.appendChild(tab);
    });
    tabsContainer.style.display = "block";
  }
  function hideArtistTabs() {
    const tabsContainer = document.getElementById("artist-tabs");
    tabsContainer.style.display = "none";
  }
  function switchToArtist(index) {
    if (index === activeArtistIndex || !artistList[index]) {
      return;
    }
    activeArtistIndex = index;
    updateTabStyles();
    renderActiveArtist();
  }
  function updateTabStyles() {
    const tabs = document.querySelectorAll("#tabs-list button");
    tabs.forEach((tab, index) => {
      if (index === activeArtistIndex) {
        tab.className = "px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 bg-blue-50 transition-colors";
      } else {
        tab.className = "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors";
      }
    });
  }
  function renderActiveArtist() {
    const activeArtist = artistList[activeArtistIndex];
    if (activeArtist) {
      renderArtist(activeArtist);
    }
  }
  document.addEventListener("keydown", (e) => {
    if (artistList.length <= 1) return;
    if (e.key === "ArrowLeft" && activeArtistIndex > 0) {
      switchToArtist(activeArtistIndex - 1);
    } else if (e.key === "ArrowRight" && activeArtistIndex < artistList.length - 1) {
      switchToArtist(activeArtistIndex + 1);
    }
  });

  // src/backend/client/cache.js
  var cacheLifeTime = 3 * 60 * 1e3;
  function getCacheKey(identifier, type = "name") {
    return `${type}:${identifier.toLowerCase()}`;
  }
  async function cacheArtist(identifier, data, type = "name") {
    const key = getCacheKey(identifier, type);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      links: data.links || []
    };
    console.log(`cached artist: ${JSON.stringify(cacheEntry)}`);
    await chrome.storage.local.set({
      [`cache_${key}`]: cacheEntry
    });
  }
  async function getCachedArtist(identifier, type = "name") {
    const key = getCacheKey(identifier, type);
    const result = await chrome.storage.local.get(`cache_${key}`);
    const cached = result[`cache_${key}`];
    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_${key}`);
      return null;
    }
    return cached.data;
  }
  async function cacheVideoResult(videoId, artistData) {
    const key = `video_${videoId}`;
    await chrome.storage.local.set({
      [`cache_${key}`]: {
        data: artistData,
        timestamp: Date.now()
      }
    });
  }
  async function getCachedVideoResult(videoId) {
    const key = `video_${videoId}`;
    const result = await chrome.storage.local.get(`cache_${key}`);
    const cached = result[`cache_${key}`];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_${key}`);
      return null;
    }
    return cached.data;
  }
  function createMediaSessionKey(mediaSessionData) {
    const title = (mediaSessionData.title || "").toLowerCase().trim();
    const artist = (mediaSessionData.channel || "").toLowerCase().trim();
    return `${artist}_${title}`.replace(/[^a-z0-9_]/g, "");
  }
  async function getCachedMediaSessionResult(mediaSessionData) {
    const key = createMediaSessionKey(mediaSessionData);
    const result = await chrome.storage.local.get(`cache_media_${key}`);
    const cached = result[`cache_media_${key}`];
    console.log(`grabbing cache with key: cache is  ${cached}`);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cacheLifeTime) {
      await chrome.storage.local.remove(`cache_media_${key}`);
      return null;
    }
    return cached.data;
  }
  async function cacheMediaSessionResult(mediaSessionData, artistData) {
    const key = createMediaSessionKey(mediaSessionData);
    await chrome.storage.local.set({
      [`cache_media_${key}`]: {
        data: artistData,
        timestamp: Date.now(),
        originalMediaData: mediaSessionData
      }
    });
    console.log(`caching data: ${key}`);
  }

  // src/connections/api.js
  var API = "https://mn-chrome-ext.vercel.app";
  async function fetchArtist(info) {
    console.log("fetchArtist called with:", info);
    const cached = getCachedArtist(info.id, "id");
    if (cached) return cached;
    const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`;
    console.log("Fetching artist from:", url);
    const r = await fetch(url);
    const artist = r.ok ? await r.json() : null;
    console.log("Artist API response:", artist);
    if (artist && !artist.error && artist.id) {
      const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
      const linksResponse = await fetch(linksUrl);
      artist.links = linksResponse.ok ? await linksResponse.json() : [];
      cacheArtist(info.id, artist, "id");
    }
    return artist;
  }
  async function fetchArtistFromName(info) {
    const cached = getCachedArtist(info.channel);
    if (cached) return cached;
    console.log("fetchArtistFromName called with:", info);
    const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
    console.log("Fetching artist from:", url);
    const r = await fetch(url);
    const artist = r.ok ? await r.json() : null;
    console.log("Artist API response:", artist);
    if (artist && !artist.error && artist.id) {
      const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
      const linksResponse = await fetch(linksUrl);
      artist.links = linksResponse.ok ? await linksResponse.json() : [];
      cacheArtist(info.channel, artist);
    }
    return artist;
  }
  async function extractMultipleArtistsFromTitle(titleOrData) {
    const url = `${API}/api/openai/extract-multiple-artists`;
    const requestBody = typeof titleOrData === "string" ? { title: titleOrData } : { data: titleOrData };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.artists || [];
  }
  async function fetchMultipleArtistsByNames(artistNames) {
    if (!artistNames || artistNames.length === 0) return [];
    console.log("fetchMultipleArtistsByNames called with:", artistNames.map((name) => decodeURIComponent(name)));
    const url = `${API}/api/artist/batch`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: artistNames.map((name) => encodeURIComponent(name)) })
    });
    if (!response.ok) {
      console.error("Batch artist fetch failed:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    console.log("Batch artist API response:", data);
    return data.artists || [];
  }

  // src/backend/browserInfo.js
  function getYTInfo(tabId) {
    return new Promise((res) => {
      chrome.tabs.sendMessage(tabId, { type: "GET_YT_INFO" }, res);
    });
  }
  async function getMediaSessionInfo(tabId) {
    try {
      const tabs = await chrome.tabs.query({});
      const promises = tabs.map(
        (tab) => new Promise((resolve) => {
          chrome.tabs.sendMessage(tab.id, { action: "checkMediaSession" }, (response) => {
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          });
        })
      );
      const results = await Promise.all(promises);
      console.log(results);
      return results.find((result) => result != null && result !== void 0);
    } catch (error) {
      console.error("Error getting media session results", error);
    }
  }
  async function isContentScriptReady(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: "checkMediaSession" }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  // src/backend/client/collabs.js
  function hasCollaborationKeywords(title) {
    const patterns = [
      /\bft\.?\s/i,
      // "ft. " or "ft "
      /\bfeat\.?\s/i,
      // "feat. " or "feat "  
      /\bfeaturing\b/i,
      // "featuring"
      /\bwith\b/i,
      // "with"
      /\sx\s/i,
      // " x " (Artist x Artist)
      /\s&\s/,
      // " & "
      /\s\+\s/,
      // " + "
      /\bvs\.?\b/i,
      // "vs" or "vs."
      /\b(collab|collaboration)\b/i,
      // "collab", "collaboration"
      /\bremix by\b/i,
      // "remix by"
      /\bprod\.? by\b/i
      // "prod by", "produced by"
    ];
    return patterns.some((pattern) => pattern.test(title));
  }

  // src/connections/fetchArtists.js
  function getVideoIdFromUrl(url) {
    const patterns = [
      /v=([^&]+)/,
      /youtu\.be\/([^?&]+)/,
      /music\.youtube\.com\/watch\?v=([^&]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  async function fetchMultipleArtists(tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let videoId = null;
    if (tab?.url) {
      videoId = getVideoIdFromUrl(tab.url);
      if (videoId) {
        const cached = await getCachedVideoResult(videoId);
        if (cached) {
          console.log("Returning cached video result for:", videoId);
          return cached;
        }
      }
    }
    const info = await getYTInfo(tabId);
    let artists = [];
    if (info?.id) {
      const artist = await fetchArtist(info);
      if (artist && !artist.error && artist.id) {
        artists.push({ ...artist, isPrimary: true });
        if (hasCollaborationKeywords(info.title)) {
          const allArtistNames = await extractMultipleArtistsFromTitle(info);
          const newNames = allArtistNames.filter(
            (name) => name.toLowerCase() !== artist.name.toLowerCase()
          );
          if (newNames.length > 0) {
            const newArtists = await fetchMultipleArtistsByNames(newNames);
            const validArtists = newArtists.filter((artist2) => artist2 && !artist2.error && artist2.id).map((artist2) => ({ ...artist2, isPrimary: false }));
            artists.push(...validArtists);
          }
        }
        if (artists.length > 0) {
          if (videoId) {
            await cacheVideoResult(videoId, artists);
          }
          return artists;
        }
      }
    }
    if (info?.title || artists.length === 0) {
      console.log("falling back to AI");
      const artistNames = await extractMultipleArtistsFromTitle(info);
      console.log(artistNames);
      if (artistNames.length > 0) {
        const foundArtists = await fetchMultipleArtistsByNames(artistNames);
        const validArtists = foundArtists.filter((artist) => artist && !artist.error && artist.id).map((artist) => ({ ...artist, isPrimary: false }));
        artists.push(...validArtists);
      }
    }
    if (videoId) {
      await cacheVideoResult(videoId, artists);
    }
    return artists;
  }
  async function fetchArtistsMediaSession() {
    const info = await getMediaSessionInfo();
    console.log("Media session info:", info);
    if (!info) {
      console.log("No media session data available");
      return "noMediaSession";
    }
    const cached = await getCachedMediaSessionResult(info);
    if (cached) {
      console.log("cached result found, returning...");
      return cached;
    }
    let artists = [];
    if (info?.title) {
      const artist = await fetchArtistFromName(info);
      if (artist && !artist.error && artist.id) {
        artists.push({ ...artist, isPrimary: true });
        if (hasCollaborationKeywords(info.title)) {
          const allArtistNames = await extractMultipleArtistsFromTitle(info);
          const newNames = allArtistNames.filter(
            (name) => name.toLowerCase() !== artist.name.toLowerCase()
          );
          if (newNames.length > 0) {
            const newArtists = await fetchMultipleArtistsByNames(newNames);
            const validArtists = newArtists.filter((artist2) => artist2 && !artist2.error && artist2.id).map((artist2) => ({ ...artist2, isPrimary: false }));
            artists.push(...validArtists);
          }
        }
        if (artists.length > 0) {
          return artists;
        }
      }
    }
    if (info?.title && artists.length === 0) {
      console.log("falling back to AI");
      const artistNames = await extractMultipleArtistsFromTitle(info);
      console.log(artistNames);
      if (artistNames.length > 0) {
        const foundArtists = await fetchMultipleArtistsByNames(artistNames);
        const validArtists = foundArtists.filter((artist) => artist && !artist.error && artist.id).map((artist) => ({ ...artist, isPrimary: false }));
        artists.push(...validArtists);
        cacheMediaSessionResult(info, artists);
      }
    }
    console.log("returning artists...");
    return artists;
  }

  // src/frontend/popup/main.js
  document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!await isContentScriptReady(tab.id)) {
      errorScreen("notInjected");
      return;
    }
    if (!tab.url.includes("youtube.com/watch") && !tab.url.includes("music.youtube.com")) {
      const artists2 = await fetchArtistsMediaSession();
      if (artists2.length > 0 && artists2 != "noMediaSession") {
        renderArtists(artists2);
      } else {
        switch (artists2) {
          case "noMediaSession": {
            errorScreen("noData");
            break;
          }
          case void 0: {
            errorScreen("noArtist");
            break;
          }
        }
      }
      return;
    }
    const artists = await fetchMultipleArtists(tab.id);
    console.log("rendering multiple artists");
    if (artists.length > 0) {
      renderArtists(artists);
    } else {
      errorScreen("noArtist");
    }
  });
})();
//# sourceMappingURL=main.js.map
