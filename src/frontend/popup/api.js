const API = 'https://mn-chrome-ext.vercel.app/';


export async function fetchArtist(info) {
  console.log(info);
  const url = info.channel
      ? `${API}/api/artist/by-id/${encodeURIComponent(info.id)}`
      : `${API}/api/artist/by-user/${encodeURIComponent(info.channel)}`;
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}