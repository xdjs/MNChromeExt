const API = 'https://mn-chrome-ext.vercel.app';
import { cacheArtist, getCachedArtist } from './cache.js';



export async function fetchArtist(info) {

  console.log(info.channel);

  const cached = getCachedArtist(info.id, 'id');
  if (cached) return cached;

  const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  
  if (artist) {
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


  console.log(info.channel);
  const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  
  if (artist) {
    // Fetch links for this artist using the correct endpoint  
    const linksUrl = `${API}/api/urlmap/links/${encodeURIComponent(artist.id)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];

    cacheArtist(info.channel, artist);
  }
  
  return artist;
}

export async function extractArtistFromTitle(title) {
  const url = `${API}/api/openai/extract-artist`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title })
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.artist; // Returns string or null
}

export async function extractMultipleArtistsFromTitle(title) {
  const url = `${API}/api/openai/extract-multiple-artists`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title })
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.artists || []; // Returns array of strings
}