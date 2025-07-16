export function renderArtist(a){
    console.log(a);
    if(!a){ document.body.textContent='Artist not found'; return; }
    titleEl().textContent = a.name ?? 'Unknown';
    bioEl().textContent   = a.bio  ?? '';
  }
  const titleEl = () => document.getElementById('id');
  const bioEl   = () => document.getElementById('bio');