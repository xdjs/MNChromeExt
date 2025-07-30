const API = 'https://mn-chrome-ext.vercel.app';
import { cacheArtist, getCachedArtist } from './cache.js';



export async function fetchArtist(info) {

  console.log('fetchArtist called with:', info);

  const cached = getCachedArtist(info.id, 'id');
  if (cached) return cached;

  const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
  console.log('Fetching artist from:', url);
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  console.log('Artist API response:', artist);
  
  if (artist && !artist.error && artist.id) {
    // Fetch links for this artist using the correct endpoint
    const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];

    cacheArtist(info.id, artist, 'id');
  }
  
  return artist;
}

export async function fetchArtistFromName(info) {

  // Check cache first
  const cached = getCachedArtist(info.channel);
  if (cached) return cached;

  console.log('fetchArtistFromName called with:', info);
  const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
  console.log('Fetching artist from:', url);
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  console.log('Artist API response:', artist);
  
  if (artist && !artist.error && artist.id) {
    // Fetch links for this artist using the correct endpoint  
    const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];

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
  
  const url = `${API}/api/artist/batch`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ usernames: artistNames })
  });

  if (!response.ok) {
    console.error('Batch artist fetch failed:', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  console.log('Batch artist API response:', data);
  
  // Return array of artists (some may be null for not found)
  return data.artists || [];
}

