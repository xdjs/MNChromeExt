"use strict";
(() => {
  // src/frontend/popup/ui.js
  function renderArtist(a) {
    const spotifyData = a.spotifyData?.data || a.spotifyData;
    const imageUrl = spotifyData?.images?.[0]?.url;
    console.log(a.bio);
    const titleEl = document.getElementById("title");
    const bioEl = document.getElementById("bio");
    const linksTitleEl = document.getElementById("links-title");
    const linksListEl = document.getElementById("links-list");
    if (imageUrl) {
      console.log(imageUrl);
      const cardEl = document.getElementById("card");
      cardEl.style.transition = "none";
      cardEl.style.transform = "scale(1.05)";
      cardEl.style.opacity = "0.8";
      cardEl.style.backgroundImage = `
        radial-gradient(circle, transparent, rgba(255,255,255,1.0)),
        url(${imageUrl})
      `;
      cardEl.style.backgroundSize = "cover";
      cardEl.style.backgroundPosition = "center";
      cardEl.style.backgroundRepeat = "no-repeat";
      cardEl.style.minHeight = "580px";
      setTimeout(() => {
        cardEl.style.transition = "all 0.4s ease-out";
        cardEl.style.transform = "scale(1)";
        cardEl.style.opacity = "1";
      }, 50);
    } else {
      console.log("no image URL detected");
    }
    const musicNerdEl = document.getElementById("MN-link");
    musicNerdEl.textContent = document.createElement("a");
    if (a.id) {
      musicNerdEl.href = `https://www.musicnerd.xyz/artist/` + a.id;
    } else {
      musicNerdEl.href = `https://www.musicnerd.xyz`;
    }
    musicNerdEl.className = "flex items-center gap-3 p-2 rounded";
    musicNerdEl.target = "_blank";
    const MNurl = document.createElement("p");
    MNurl.className = "text-sm text-gray-500 truncate";
    if (a.id) {
      MNurl.textContent = "View on MusicNerd.xyz";
    } else {
      MNurl.textContent = "Add them on MusicNerd.xyz";
    }
    musicNerdEl.appendChild(MNurl);
    musicNerdEl.addEventListener("mouseenter", () => {
      linkWrapper.style.transform = "scale(1.1)";
      linkWrapper.style.transition = "transform 0.3s ease";
    });
    musicNerdEl.addEventListener("mouseleave", () => {
      linkWrapper.style.transform = "scale(1.0)";
      linkWrapper.style.transition = "transform 0.3s ease";
    });
    titleEl.textContent = a.name ?? "Sorry, we don't know this artist!";
    bioEl.textContent = typeof a.bio === "string" ? a.bio : a.bio?.bio ?? a.bio?.text ?? "No bio Available";
    titleEl.appendChild(bioEl);
    titleEl.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    titleEl.style.borderRadius = "8px";
    titleEl.style.padding = "16px";
    titleEl.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
    titleEl.style.backdropFilter = "blur(5px)";
    bioEl.style.textTransform = "none";
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
          const linkWrapper2 = document.createElement("a");
          linkWrapper2.href = l.url ?? l.href ?? "#";
          linkWrapper2.target = "_blank";
          linkWrapper2.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
          linkWrapper2.style.borderRadius = "8px";
          linkWrapper2.style.padding = "8px";
          linkWrapper2.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          linkWrapper2.style.backdropFilter = "blur(5px)";
          linkWrapper2.style.marginBottom = "8px";
          linkWrapper2.className = "flex items-center gap-3 hover:bg-gray-50 p-2 rounded";
          linksListEl.style.gap = "4px";
          linkWrapper2.addEventListener("mouseenter", () => {
            linkWrapper2.style.transform = "scale(1.1)";
            linkWrapper2.style.transition = "transform 0.3s ease";
          });
          linkWrapper2.addEventListener("mouseleave", () => {
            linkWrapper2.style.transform = "scale(1.0)";
            linkWrapper2.style.transition = "transform 0.3s ease";
          });
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
          linkWrapper2.appendChild(img);
          linkWrapper2.appendChild(textContainer);
          li.appendChild(linkWrapper2);
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
      tab.style.background = `linear-gradient(to bottom, 
        rgba(255,255,255,0) 0%, 
        rgba(255,255,255,0.2) 30%, 
        rgba(255,255,255,0.8) 80%, 
        rgba(255,255,255,1) 100%
        )`;
      tab.style.padding = "8px";
      tabsList.appendChild(tab);
    });
    tabsContainer.style.display = "flex";
    tabsContainer.style.overflowX = "auto";
    tabsContainer.style.whiteSpace = "nowrap";
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
      tab.style.background = `linear-gradient(to bottom, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.2) 30%, 
    rgba(255,255,255,0.8) 80%, 
    rgba(255,255,255,1) 100%
    )`;
      tab.style.padding = "8px";
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
    const cached = await getCachedArtist(info.id, "id");
    if (cached) {
      console.log("[DEBUG: returning cached " + JSON.stringify(cached) + "]");
      return cached;
    }
    const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`;
    console.log("Fetching artist from:", url);
    const r = await fetch(url);
    const artist = r.ok ? await r.json() : null;
    console.log("Artist API response:", artist);
    if (artist && artist.id) {
      const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
      const linksResponse = await fetch(linksUrl);
      artist.links = linksResponse.ok ? await linksResponse.json() : [];
      try {
        const spotifyUrl = `https://api.musicnerd.xyz/api/getSpotifyData?spotifyId=${artist.spotify}`;
        const spotifyRes = await fetch(spotifyUrl);
        if (spotifyRes.ok) {
          artist.spotifyData = await spotifyRes.json();
        }
      } catch {
        artist.spotifyData = null;
      }
      cacheArtist(info.id, artist, "id");
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
    console.log("fetchMultipleArtistsByNames called with:", artistNames);
    const url = `https://api.musicnerd.xyz/api/searchArtists/batch`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query: { artists: artistNames } })
    });
    if (!response.ok) {
      console.error("Batch artist fetch failed:", response.status, response.statusText);
      return [];
    }
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    console.log("Batch artist API response:", data);
    const filtered = results.filter(
      (a) => a && a.id && a.matchScore == 0
    );
    if (filtered.length == 0) {
      return null;
    }
    const artistIds = filtered.map((a) => a.id);
    const linksRes = await fetch(`${API}/api/urlmap/links/${artistIds.join(",")}`);
    const allLinks = await linksRes.json();
    const spotifyIds = filtered.map((a) => a.spotify);
    const spotifyRes = await fetch(`https://api.musicnerd.xyz/api/getSpotifyData?spotifyIds=${spotifyIds.join(",")}`);
    const spotifyInfo = await spotifyRes.json();
    const withBio = await Promise.all(filtered.map(async (artist) => {
      if (!artist || !artist.id) return artist;
      const bioUrl = `https://api.musicnerd.xyz/api/artistBio/${encodeURIComponent(artist.id)}`;
      const bioRes = await fetch(bioUrl, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const bio = bioRes.ok ? await bioRes.json() : null;
      return { ...artist, bio };
    }));
    const withData = withBio.map((artist) => ({
      ...artist,
      links: allLinks[artist.id] || [],
      spotifyData: spotifyInfo.data?.find((s) => s.id === artist.spotify) || null
    }));
    return withData;
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
      console.log("[DEBUG] " + info.id);
      const artist = await fetchArtist(info);
      if (artist.id) {
        artists.push({ ...artist, isPrimary: true });
        console.log("[DEBUG] Youtube lookup successful: " + artists);
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
    if (!info?.title || artists.length === 0) {
      console.log("falling back to AI");
      const artistNames = await extractMultipleArtistsFromTitle(info);
      console.log(artistNames);
      if (artistNames.length > 0) {
        const foundArtists = await fetchMultipleArtistsByNames(artistNames);
        if (!foundArtists) {
          return null;
        }
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
    const artistNames = await extractMultipleArtistsFromTitle(info);
    console.log(artistNames);
    if (artistNames.length > 0) {
      const foundArtists = await fetchMultipleArtistsByNames(artistNames);
      const validArtists = foundArtists.filter((artist) => artist && !artist.error && artist.id).map((artist) => ({ ...artist, isPrimary: false }));
      artists.push(...validArtists);
      cacheMediaSessionResult(info, artists);
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
      if (artists2) {
        console.log("found artists, rendering: " + artists2.length + " artists");
        if (artists2.length > 0 && artists2 != "noMediaSession") {
          renderArtists(artists2);
        } else if (artists2 == "noMediaSession") {
          errorScreen("noData");
        } else {
          errorScreen("noArtist");
        }
      } else {
        console.log("[ERROR] no artist returned for mediaSession");
        errorScreen("noArtist");
      }
      return;
    }
    const artists = await fetchMultipleArtists(tab.id);
    console.log("rendering multiple artists");
    if (artists) {
      console.log(artists);
      if (artists.length > 0) {
        renderArtists(artists);
      } else {
        console.log("[ERROR] no artists detected, showing error");
        errorScreen("noArtist");
      }
    } else {
      errorScreen("noArtist");
    }
  });
})();
//# sourceMappingURL=main.js.map
