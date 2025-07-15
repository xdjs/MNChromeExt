"use strict";
console.log('[ext] content script loaded');
Object.defineProperty(exports, "__esModule", { value: true });
var pageScraper_1 = require("../backend/pageScraper");
chrome.runtime.onMessage.addListener(function (req, _sender, sendResponse) {
    if (req.type === 'GET_YT_INFO') {
        sendResponse(typeof pageScraper_1.getYTInfo === 'function' ? (0, pageScraper_1.getYTInfo)() : null);
    }
});
