const API = 'https://mn-chrome-ext.vercel.app/';


export async function fetchArtist(info) {
  console.log(info.channel);
  const url = `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

export async function fetchArtistFromName(info) {
  console.log(info.channel);
  const url = `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}