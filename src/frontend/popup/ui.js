export function renderArtist(a){
    
    console.log(a);
    if(!a){ document.body.textContent='Artist not found'; return; }

    console.log(a.bio);
    const titleEl = document.getElementById('title');
    const bioEl = document.getElementById('bio');
    const linksTitleEl = document.getElementById('links-title');
    const linksListEl  = document.getElementById('links-list');

    const musicNerdEl = document.getElementById('MN-link');

        musicNerdEl.textContent = document.createElement('a');
        if (a.id) {
            musicNerdEl.href =  `https://www.musicnerd.xyz/artist/` + a.id;
        }
        else {
            musicNerdEl.href =  `https://www.musicnerd.xyz`;
        }
        musicNerdEl.className = 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded';
        musicNerdEl.target = '_blank';
    
        const MNurl = document.createElement('p');
              MNurl.className = 'text-sm text-gray-500 truncate';
              if (a.id) {
                MNurl.textContent = 'View on MusicNerd.xyz';
              }
              else {
                MNurl.textContent = 'Add them on MusicNerd.xyz';
              }
              
    
        musicNerdEl.appendChild(MNurl);
    

    

    titleEl.textContent = a.name ?? "Sorry, we don't know this artist!";
    bioEl.textContent = a.bio ?? "No bio Available";
    if (!a.id) {
        bioEl.textContent = "";
    }


    

    // Populate links header - hide if no artist ID
    if (linksTitleEl) {
      if (a.id) {
        linksTitleEl.textContent = `${a.name ?? 'Artist'}'s Links`;
        linksTitleEl.style.display = 'block';
      } else {
        linksTitleEl.style.display = 'none';
      }
    }

    // Clear previous list items
    if (linksListEl) {
      linksListEl.innerHTML = '';



      if (Array.isArray(a.links) && a.links.length > 0) {
        a.links.forEach(l => {
          const li = document.createElement('li');

          // Create clickable link wrapper
          const linkWrapper = document.createElement('a');
          linkWrapper.href = l.url ?? l.href ?? '#';
          linkWrapper.target = '_blank'; // Open in new tab
          linkWrapper.className = 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded';
          
          const label = document.createElement('p');
          label.className = 'font-semibold uppercase text-sm text-blue-600 hover:text-blue-800';
          label.textContent = l.label ?? l.title ?? 'Link';

          const url = document.createElement('p');
          url.className = 'text-sm text-gray-500 truncate';
          if (l.platformTypeList && l.platformTypeList.includes('social')) {
            url.textContent = a[l.label] ?? l.url ?? l.href ?? '';
          }
          else {
            url.textContent = '';
          }

          const img = document.createElement('img');
          img.src = l.image;
          img.alt = 'Artist Photo'
          img.className = 'w-8 h-8 rounded-full object-cover flex-shrik-0'; 

          const textContainer = document.createElement('div');
          textContainer.className = 'flex-1 min-w-0';

          textContainer.appendChild(label);
          textContainer.appendChild(url);

          linkWrapper.appendChild(img);
          linkWrapper.appendChild(textContainer);
          li.appendChild(linkWrapper);
          linksListEl.appendChild(li);
        });
      } else if (a.id) {
        const li = document.createElement('li');
        li.className = 'text-gray-400 text-sm';
        li.textContent = 'No links available';
        linksListEl.appendChild(li);
      }
      else {
        const li = document.createElement('li');
        li.className = 'text-gray-400 text-sm';
        li.textContent = '';
        linksListEl.appendChild(li);
      }
    }

    console.log(titleEl);
    console.log(bioEl);
  }
  