import { index } from "drizzle-orm/mysql-core";
import { renderArtist } from "./ui";

let artistList = [];

let activeArtistIndex = 0;

export function renderArtists(artists) {
    artistList = artists;

    // Handle edge cases
  if (!artists || artists.length === 0) {
    document.body.textContent = 'Artist not found';
    return;
  }
  
  // Single artist - use existing UI
  if (artists.length === 1) {
    hideArtistTabs();
    renderArtist(artists[0]);
    return;
  }
  
  // Multiple artists - show tab interface
  showArtistTabs(artists);
  renderActiveArtist();
}

function showArtistTabs(artists) {
    const tabsContainer = document.getElementById('artist-tabs');
    const tabsList = document.getElementById('tabs-list');

    tabsList.innerHTML = '';
    artists.forEach((artist, index) => {
        const tab = document.createElement('button');
        tab.className = `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            index === activeArtistIndex
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;

        const displayName = artist.name || 'Unknown artist';
        tab.textContent = artist.isPrimary ? `${displayName} ⭐` : displayName;

        tab.addEventListener('click', () => switchToArtist(index));
        tabsList.appendChild(tab);
    });

    tabsContainer.style.display = 'none';
}

function hideArtistTabs() {
    const tabsContainer = document.getElementById('artist-tabs');
    tabsContainer.style.display = 'none';
}

function switchToArtist(index) {
    if (index === activeArtistIndex || !artistList[index]) {
        return;
    }

    activeArtistIndex = index;
    updateTabStyles();
    renderActiveArtist();
}

function updateTabStyles() {
    const tabs = document.querySelectorAll('#tabs-list button');
  tabs.forEach((tab, index) => {
    if (index === activeArtistIndex) {
      tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600 bg-blue-50 transition-colors';
    } else {
      tab.className = 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors';
    }
  });
}

function renderActiveArtist() {
    const activeArtist = currentArtists[activeArtistIndex];
    if (activeArtist) {
      renderArtist(activeArtist);
    }
  }
  

  document.addEventListener('keydown', (e) => {
    if (currentArtists.length <= 1) return;
    
    if (e.key === 'ArrowLeft' && activeArtistIndex > 0) {
      switchToArtist(activeArtistIndex - 1);
    } else if (e.key === 'ArrowRight' && activeArtistIndex < currentArtists.length - 1) {
      switchToArtist(activeArtistIndex + 1);
    }
  });