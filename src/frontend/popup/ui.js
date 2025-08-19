export function renderArtist(a){


    const spotifyData = a.spotifyData?.data || a.spotifyData;
    const imageUrl = spotifyData?.images?.[0]?.url;


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
        musicNerdEl.className = 'flex items-center gap-3 p-2 rounded';
        musicNerdEl.target = '_blank';
        
    
        const MNurl = document.createElement('p');
              MNurl.className = 'text-sm text-gray-500 truncate';
              if (a.id) {
                MNurl.textContent = 'View on MusicNerd.xyz';
              }
              else {
                MNurl.textContent = 'Add them on MusicNerd.xyz';
              }
              
              // Add logo image
        const logoImg = document.createElement('img');
            logoImg.src = 'assets/mn-logo-48.png'; // Use smaller logo
            logoImg.alt = 'MN';
            logoImg.className = 'w-4 h-4 mr-0'; // Small size with margin
            logoImg.style.display = 'inline-block';
            logoImg.style.verticalAlign = 'middle';

        // Append both to the link
        musicNerdEl.appendChild(logoImg);
        musicNerdEl.appendChild(MNurl);
        
        musicNerdEl.style.textTransform = 'none';
          musicNerdEl.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          musicNerdEl.style.borderRadius = '8px';
          musicNerdEl.style.padding = '8px';
          musicNerdEl.style.boxShadow= '0 2px 8px rgba(0, 0, 0, 0.1)';
        


    

    

    titleEl.textContent = a.name ?? "Sorry, we don't know this artist!";
    bioEl.textContent = typeof a.bio === 'string' ? a.bio : (a.bio?.bio ?? a.bio?.text ?? "No bio Available");

      titleEl.appendChild(bioEl);
      titleEl.appendChild(musicNerdEl);
      titleEl.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        titleEl.style.borderRadius = '8px';
        titleEl.style.padding = '16px';
        titleEl.style.boxShadow= '0 2px 8px rgba(0, 0, 0, 0.1)';
        titleEl.style.backdropFilter = 'blur(5px)';


      bioEl.style.textTransform = 'none';
        bio.style.marginBottom = '4px';

      
      
    
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
          li.style.backdropFilter = 'blur(5px)';




          // Create clickable link wrapper
          const linkWrapper = document.createElement('a');
          li.appendChild(linkWrapper);
          linkWrapper.href = l.url ?? l.href ?? '#';
          linkWrapper.target = '_blank'; // Open in new tab
          linkWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          linkWrapper.style.borderRadius = '8px';
          linkWrapper.style.padding = '8px';
          linkWrapper.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          linkWrapper.style.marginBottom = '8px';
          linkWrapper.className = 'flex items-center gap-3 hover:bg-gray-50 p-2 rounded';
          linksListEl.style.gap = '4px'; // Custom spacing

          linkWrapper.addEventListener('mouseenter', () => {
            linkWrapper.style.transform = 'scale(1.1)';
            linkWrapper.style.transition = 'transform 0.3s ease';
          });

          linkWrapper.addEventListener('mouseleave', () => {
            linkWrapper.style.transform = 'scale(1.0)';
            linkWrapper.style.transition = 'transform 0.3s ease';
          });



          
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

    if (imageUrl) {
      console.log(imageUrl);
      const cardEl = document.getElementById('card');

      // Add the scale transition


      titleEl.style.transition = 'none';
      cardEl.style.transition = 'none';
        titleEl.style.opacity = '0.5';
      linksListEl.style.opacity = '0.5';
        linksListEl.style.transition = 'none';
      cardEl.style.borderRadius = '12px'; // Rounded corners
        cardEl.style.overflow = 'hidden'; // Clips image to rounded shape
      

      cardEl.style.backgroundImage = `
        radial-gradient(ellipse 100% 100% at center, 
        transparent 30%, 
        rgba(255,255,255,0.8) 70%,
        rgba(255,255,255,1) 90%
      ),
        url(${imageUrl})
      `;

    
        cardEl.style.transform = 'scale(.97)';
          cardEl.style.backgroundSize = 'cover';
          cardEl.style.backgroundPosition = 'center';
          cardEl.style.backgroundRepeat = 'no-repeat';
          cardEl.style.minHeight = '580px';
          cardEl.style.transform = 'translateX(-20px)'

        titleEl.style.transform = 'translateX(-40px)'

        linksListEl.style.transform = 'translateX(-40px)'


      
        

      

      setTimeout(() => {
        cardEl.style.transition = 'all 0.4s ease-out';
        cardEl.style.transform = 'scale(1)';
        cardEl.style.opacity = '1';
        cardEl.style.filter = 'grayscale(0%)';
        cardEl.style.transform = 'translateX(0px)'

        
      }, 50);

      setTimeout(() => {
        titleEl.style.transition = 'all 0.3s ease-out';
        linksListEl.style.transition = 'all 0.4s ease-out';
        titleEl.style.transform = 'translateX(0px)'
        linksListEl.style.transform = 'translateX(0px)'
        titleEl.style.opacity = '1'
        linksListEl.style.opacity = '1'
      }, 100);
      

      
    }
    else {
      console.log("no image URL detected");
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
    titleEl.textContent ="Music Nerd isn't ready yet.";
    bioEl.textContent = "Please refresh this page or restart your browser to get started.";
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