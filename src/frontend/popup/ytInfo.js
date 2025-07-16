export function getYTInfo(tabId){
    return new Promise(res=>{
      chrome.tabs.sendMessage(tabId,{type:'GET_YT_INFO'},res);
    });
  }

export function scrapeYTInfo(tabId) {
    return new Promise(res => {
        chrome.tabs.sendMessage(tabId, {type: 'SCRAPE_YT_INFO'}, res);
    });
}