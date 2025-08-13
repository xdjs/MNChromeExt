const cacheLifeTime = 3*60*1000;

function getCacheKey(identifier, type = 'name') {
    return `${type}:${identifier.toLowerCase()}`;
}

export async function cacheArtist(identifier, data, type = 'name') {
    const key = getCacheKey(identifier, type);
    const cacheEntry = {
        data,
        timestamp: Date.now(),
        links: data.links || [],

    };

    console.log(`cached artist: ${JSON.stringify(cacheEntry)}`);

    await chrome.storage.local.set({
        [`cache_${key}`]: cacheEntry
    });

    
}

export async function getCachedArtist(identifier, type = 'name') {
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

export async function clearCache() {
    const allItems = await chrome.storage.local.get();
    const cacheKeys = Object.keys(allItems).filter(key => key.startsWith('cache_'));
    await chrome.storage.local.remove(cacheKeys);
}

export async function cacheVideoResult(videoId, artistData) {
    const key = `video_${videoId}`;
    await chrome.storage.local.set({
        [`cache_${key}`]: {
            data: artistData,
            timestamp: Date.now()
        }
    });
}

export async function getCachedVideoResult(videoId) {
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
    // Create a stable key from title and artist
    const title = (mediaSessionData.title || '').toLowerCase().trim();
    const artist = (mediaSessionData.channel || '').toLowerCase().trim();
    
    // Simple hash or concatenation
    return `${artist}_${title}`.replace(/[^a-z0-9_]/g, '');
}

export async function getCachedMediaSessionResult(mediaSessionData) {
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

export async function cacheMediaSessionResult(mediaSessionData, artistData) {
    const key = createMediaSessionKey(mediaSessionData)
    await chrome.storage.local.set({
        [`cache_media_${key}`]: {
            data: artistData,
            timestamp: Date.now(),
            originalMediaData: mediaSessionData
        }
    });
    console.log(`caching data: ${key}`)
}