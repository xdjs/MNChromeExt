document.addEventListener('DOMContentLoaded', async () =>  {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  chrome.tabs.sendMessage(tab.id, {type: 'GET_YT_INFO'}, (info) => {
    if (chrome.runtime.lastError || !info) {
      document.body.textContent = 'No YouTube info available';
      return;
    }

    const title = info.videoTitle || info.title || 'Unknown Title';
    document.body.innerHTML = `
    <h3 style="margin:0">${title}</h3>
    <p style="margin:4px 0 0 0;color:#666">${info.channel}</p>
    <p style="margin:4px 0 0 0;color:#666">${info.description}</p>
    `;
  })
})