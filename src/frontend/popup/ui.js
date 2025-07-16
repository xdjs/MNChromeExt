export function renderArtist(a){
    
    console.log(a);
    if(!a){ document.body.textContent='Artist not found'; return; }

    console.log(a.bio);
    const titleEl = document.getElementById('title');
    const bioEl = document.getElementById('bio');

    titleEl.textContent = a.name ?? 'Unknown';
    bioEl.textContent = a.bio ?? 'No Bio';

    console.log(titleEl);
    console.log(bioEl);
  }
  