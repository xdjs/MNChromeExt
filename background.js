

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === 'hello') {
    console.log('Received greeting from content script.');
    sendResponse({ reply: 'hi' });
  }
  
  if (request.action === 'musicDetected') {
    chrome.action.setBadgeText({text: "♪"});
    chrome.action.setBadgeBackgroundColor({color: "#4CAF50"});
  }

  if (request.action === 'musicPaused') {
    chrome.action.setBadgeText({text: ""});
    chrome.action.setBadgeBackgroundColor({color: "#4CAF50"});
  }
}); 

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Extension icon clicked, attempting to open side panel');
    
    // Enable and open the side panel for this tab
    await chrome.sidePanel.open({ tabId: tab.id });
    console.log('Side panel opened successfully');
  } catch (error) {
    console.error('Error opening side panel:', error);
    
    // Fallback: try opening as a new tab if side panel fails
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  }
});




