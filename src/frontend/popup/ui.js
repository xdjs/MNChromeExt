const API = 'https://mn-chrome-ext.vercel.app/';


export function renderArtist(a){
    
    console.log(a);
    if(!a){ document.body.textContent='Artist not found'; return; }

    console.log(a.bio);
    const titleEl = document.getElementById('title');
    const bioEl = document.getElementById('bio');
    const linksTitleEl = document.getElementById('links-title');
    const linksListEl  = document.getElementById('links-list');

    titleEl.textContent = a.name ?? 'Unknown';
    bioEl.textContent = a.bio ?? 'No Bio';

    // Populate links header
    if (linksTitleEl) {
      linksTitleEl.textContent = `${a.name ?? 'Artist'}'s Links`;
    }

    // Clear previous list items
    if (linksListEl) {
      linksListEl.innerHTML = '';



      if (Array.isArray(a.links) && a.links.length > 0) {
        a.links.forEach(l => {
          const li = document.createElement('li');

          const label = document.createElement('p');
          label.className = 'font-semibold uppercase text-sm';
          label.textContent = l.label ?? l.title ?? 'Link';

          const url = document.createElement('p');
          url.className = 'text-sm text-gray-500 truncate';
          url.textContent = l.url ?? l.href ?? '';

          li.appendChild(label);
          li.appendChild(url);
          linksListEl.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'text-gray-400 text-sm';
        li.textContent = 'No links available';
        linksListEl.appendChild(li);
      }
    }

    console.log(titleEl);
    console.log(bioEl);
  }
  