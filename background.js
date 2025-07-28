chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === 'hello') {
    console.log('Received greeting from content script.');
    sendResponse({ reply: 'hi' });
  }
}); 