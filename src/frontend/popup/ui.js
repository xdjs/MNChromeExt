export function renderArtist(a){


    const imageUrl = a.spotifyData?.data?.images?.[0]?.url;


    console.log(a.bio);
    const titleEl = document.getElementById('title');
    const bioEl = document.getElementById('bio');
    const linksTitleEl = document.getElementById('links-title');
    const linksListEl  = document.getElementById('links-list');


    if (imageUrl) {
      console.log(imageUrl);
      const cardEl = document.getElementById('card');

      cardEl.style.backgroundImage =  `
        radial-gradient(circle, transparent, rgba(255,255,255,1.0)),
        url(${imageUrl})
      `;
      cardEl.style.backgroundSize = 'cover';
      cardEl.style.backgroundPosition = 'center';
      cardEl.style.backgroundRepeat = 'no-repeat';
      cardEl.style.minHeight = '580px';

      
      
    }
    else {
      console.log("no image URL detected");
    }
    

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
    bioEl.textContent = typeof a.bio === 'string' ? a.bio : (a.bio?.bio ?? a.bio?.text ?? "No bio Available");
    if (a.bio) {
      titleEl.appendChild(bioEl);
      titleEl.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
      titleEl.style.borderRadius = '8px';
      titleEl.style.padding = '16px';
      titleEl.style.boxShadow= '0 2px 8px rgba(0, 0, 0, 0.1)';
      titleEl.style.backdropFilter = 'blur(10px)';
      bioEl.style.textTransform = 'none';


    }
    
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
          linkWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          linkWrapper.style.borderRadius = '8px';
          linkWrapper.style.padding = '8px';
          linkWrapper.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          linkWrapper.style.backdropFilter = 'blur(10px)';
          linkWrapper.style.marginBottom = '8px';
          linkWrapper.className = 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded';
          linksListEl.style.gap = '4px'; // Custom spacing
          
          const label = document.createElement('p');
          label.className = 'font-semibold uppercase text-sm text-blue-600 hover:text-blue-800';
          label.textContent = l.label ?? l.title ?? 'Link';

          const url = document.createElement('p');
          url.className = 'text-sm text-gray-500 truncate';
          if (l.platform_type_list && l.platform_type_list.includes('social')) {
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



export function errorScreen(error) {
  const titleEl = document.getElementById('title');
  const bioEl = document.getElementById('bio');

switch (error) {
  case "noArtist": {
    titleEl.textContent ="Sorry, we don't know this artist!";
  bioEl.textContent = "If you'd like, you can add them on MusicNerd!";

  const musicNerdEl = document.getElementById('MN-link');
  musicNerdEl.textContent = document.createElement('a');
  musicNerdEl.className = 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded';
  musicNerdEl.target = '_blank';
  musicNerdEl.href =  `https://www.musicnerd.xyz`;
  const MNurl = document.createElement('p');
  MNurl.className = 'text-sm text-gray-500 truncate';
  MNurl.textContent = 'Add them on MusicNerd.xyz';
  musicNerdEl.appendChild(MNurl);
  break;
  }

  case "noData": {
    titleEl.textContent ="We don't see anything playing!";
    bioEl.textContent = "Start playing something to get started!";
    break;
  }

  case "notInjected": {
    titleEl.textContent ="Our system isn't hooked up yet.";
    bioEl.textContent = "If you've just installed or reloaded the application, \n please restart your browser or reload the page.";
    break;
  }

  case "default": {
    titleEl.textContent ="An error has occured.";
    break;
  }

  default: {
    titleEl.textContent ="An error has occured.";
    break;
  }
}

console.log(titleEl);
console.log(bioEl);
}