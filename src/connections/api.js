const API = 'https://mn-chrome-ext.vercel.app';
import { cacheArtist, getCachedArtist } from '../backend/client/cache.js';



export async function fetchArtist(info) {

  console.log('fetchArtist called with:', info);

  const cached = await getCachedArtist(info.id, 'id');
  if (cached) {console.log("[DEBUG: returning cached " + JSON.stringify(cached) + "]"); return cached;}

    

  const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
  console.log('Fetching artist from:', url);
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  console.log('Artist API response:', artist);
  
  if (artist && artist.id) {
    // Fetch links for this artist using the correct endpoint
    const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];

    try {
      const spotifyUrl = `https://api.musicnerd.xyz/api/getSpotifyData?spotifyId=${artist.spotify}`;
      const spotifyRes = await fetch(spotifyUrl)

      if (spotifyRes.ok) {
        artist.spotifyData = await spotifyRes.json();
      } 
    } catch {
      artist.spotifyData = null;
    }

    cacheArtist(info.id, artist, 'id');

    
  }
  
  return artist;
}

export async function fetchArtistFromName(info) {

  // Check cache first
  const cached = await getCachedArtist(info.channel);
  if (cached) return cached;

  console.log('fetchArtistFromName called with:', info);
  // Use batch endpoint with a single username to avoid path issues with '/'
  const url = `https://api.musicnerd.xyz/api/searchArtists/batch`;
  console.log('Fetching artist from (batch-single):', info.channel);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: { artists: [info.channel] } })
  });
  const data = r.ok ? await r.json() : { artists: [null] };
  const artist = Array.isArray(data.results) ? data.results[0] : null;
  console.log('Artist API response:', artist);

  if (artist.matchScore != 0) {
    return null;
  }
  
  if (artist && !artist.error && artist.id) {
    // Fetch links for this artist using the correct endpoint  
    const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
    const linksResponse = await fetch(linksUrl);

    
    artist.links = linksResponse.ok ? await linksResponse.json() : [];

    try {
      const bioRes = await fetch(`https://api.musicnerd.xyz/api/artistBio/${encodeURIComponent(artist.id)}`, {
        headers: { Accept: 'application/json' }
      });
      if (bioRes.ok) {
        const bioJson = await bioRes.json();
        artist.bio = typeof bioJson === 'string' ? bioJson : (bioJson?.bio ?? bioJson?.text ?? null);
      } else {
        artist.bio = null;
      }
    } catch {
      artist.bio = null;
    }

    try {
      const spotifyUrl = `https://api.musicnerd.xyz/api/getSpotifyData?spotifyId=${artist.spotify}`;
      const spotifyRes = await fetch(spotifyUrl)

      if (spotifyRes.ok) {
        artist.spotifyData = await spotifyRes.json();
      } 
    } catch {
      artist.spotifyData = null;
    }


    cacheArtist(info.channel, artist);
  }
  
  return artist;
}

export async function extractArtistFromTitle(titleOrData) {
  const url = `${API}/api/openai/extract-artist`;
  
  // Support both legacy title string and new data object
  const requestBody = typeof titleOrData === 'string' 
    ? { title: titleOrData }
    : { data: titleOrData };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.artist; // Returns string or null
}

export async function extractMultipleArtistsFromTitle(titleOrData) {
  const url = `${API}/api/openai/extract-multiple-artists`;
  
  // Support both legacy title string and new data object
  const requestBody = typeof titleOrData === 'string' 
    ? { title: titleOrData }
    : { data: titleOrData };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.artists || []; // Returns array of strings
}

export async function fetchMultipleArtistsByNames(artistNames) {
  if (!artistNames || artistNames.length === 0) return [];

  console.log('fetchMultipleArtistsByNames called with:', artistNames);
  
  const url = `https://api.musicnerd.xyz/api/searchArtists/batch`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    body: JSON.stringify({ query: { artists: artistNames } })
  });

  if (!response.ok) {
    console.error('Batch artist fetch failed:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  console.log('Batch artist API response:', data);

  const filtered = results.filter(a =>
    a && a.id && a.matchScore == 0
  );

  const artistIds = filtered.map(a => a.id);

  const linksRes = await fetch(`${API}/api/urlmap/links/${artistIds.join(',')}`);

  const allLinks = await linksRes.json;
  
  const withData = await Promise.all(filtered.map(async (artist) => {

        if (!artist || !artist.id) return artist;
        const bioUrl = `https://api.musicnerd.xyz/api/artistBio/${encodeURIComponent(artist.id)}`;
        const spotifyUrl = `https://api.musicnerd.xyz/api/getSpotifyData?spotifyId=${artist.spotify}`;
      
        const [bioRes, spotifyRes] = await Promise.all([
          fetch(bioUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          }),
          fetch(spotifyUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          })
        ]);
        
      
        const bio = bioRes.ok ? await bioRes.json() : null;
        const spotifyData = spotifyRes.ok ? await spotifyRes.json() : null;

        
        return { ...artist, bio, spotifyData};
    }));

    const withLinks = withData.map(artist => ({
      ...artist,
      links: allLinks[artist.id] || [],
  }));

    return withLinks;
  
}

