"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYTInfo = getYTInfo;
function getYTInfo() {
    const title = document.querySelector('h1.title yt-formatted-string') ||
    document.querySelector('ytd-watch-metadata h1');

    const channelName = document.querySelector('#owner-name a') || 
    document.querySelector('ytd-channel-name#channel-name a');

    if (title) {
        console.log('Title: ', title.textContent.trim());
    }
    if (channelName) {
        console.log('Channel: ', channelName.textContent.trim());
    }
    if (channelName && title) {
        return {
            videoTitle: title.textContent.trim(),
            channel: channelName.textContent.trim(),
        };
    }
    console.log('no channel info foiund.');
    return null;
}
