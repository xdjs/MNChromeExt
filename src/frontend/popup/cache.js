const artistCache = new Map();
const cacheLifeTime = 3*60*1000;

function getCacheKey(identifier, type = 'name') {
    return `${type}:${identifier.toLowerCase()}`;
}

export function cacheArtist(identifier, data, type = 'name') {
    const key = getCacheKey(identifier, type);
    artistCache.set(key, {
        data,
        timestamp: Date.now(),
        links: data.links || []
    });
}

export function getCachedArtist(identifier, type = 'name') {
    const key = getCacheKey(identifier, type);
    const cached = artistCache.get(key);

    if (!cached) {
        return null;
    }

    if (Date.now() = cached.timestamp > cacheLifeTime) {
        artistCache.delete(key);
        return null;
    }

    return cached.data;
}

export function clearCache() {
    artistCache.clear();
}

