const API = 'https://mn-chrome-ext.vercel.app/';


export async function fetchArtist(info) {
  console.log(info.channel);
  const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  
  if (artist) {
    // Fetch links for this artist using the correct endpoint
    const linksUrl = `mn-chrome-ext-git-max-prototype-frontend-musicnerd.vercel.app/api/urlmap/links/${encodeURIComponent(info.id)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];
  }
  
  return artist;
}

export async function fetchArtistFromName(info) {
  console.log(info.channel);
  const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
  const r = await fetch(url);
  const artist = r.ok ? await r.json() : null;
  
  if (artist) {
    // Fetch links for this artist using the correct endpoint  
    const linksUrl = `mn-chrome-ext-git-max-prototype-frontend-musicnerd.vercel.app/api/urlmap/links/${encodeURIComponent(artist.id || info.channel)}`;
    const linksResponse = await fetch(linksUrl);
    artist.links = linksResponse.ok ? await linksResponse.json() : [];
  }
  
  return artist;
}