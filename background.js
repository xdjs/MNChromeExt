chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === 'hello') {
    console.log('Received greeting from content script.');
    sendResponse({ reply: 'hi' });
  }
  
  if (request.action === 'musicDetected') {
    console.log("Music Detected")
    chrome.action.setBadgeText({text: "♪"});
    chrome.action.setBadgeBackgroundColor({color: "#4CAF50"});
  }

  if (request.action === 'musicPaused') {
    console.log("Music Detected")
    chrome.action.setBadgeText({text: ""});
    chrome.action.setBadgeBackgroundColor({color: "#4CAF50"});
  }
}); 

