export function getYTInfo(tabId){
    return new Promise(res=>{
      chrome.tabs.sendMessage(tabId,{type:'GET_YT_INFO'},res);
    });
  }


export async function getMediaSessionInfo(tabId) {
try {
  const tabs = await chrome.tabs.query({});
  
  const promises = tabs.map(tab =>
    new Promise(resolve => {
      chrome.tabs.sendMessage(tab.id, {action: 'checkMediaSession'}, response => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else  {
          resolve(response);
        }
      });
    })
  );

  const results = await Promise.all(promises);

  console.log(results);
  return results.find(result => result != null && result !== undefined);
} catch(error) {
  console.error('Error getting media session results', error);
}
}

export async function isContentScriptReady(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, {action: 'checkMediaSession'}, (response) => {
      if (chrome.runtime.lastError) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}