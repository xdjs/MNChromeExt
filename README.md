# Chrome Extension Template

A template project for building Chrome extensions using Manifest V3.

## Project Structure

- `manifest.json` — Extension manifest
- `src/background.js` — Background service worker
- `src/content.js` — Content script injected into pages
- `popup.html`, `popup.css`, `src/popup.js` — Popup UI
- `options.html`, `src/options.js` — Options page

## Getting Started

1. Clone the repository:

```bash
git clone <repo-url>
```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" and click "Load unpacked".

4. Select the project directory (`MNChromeExt/`) to load the extension.

5. Start hacking!

## Packaging

When you're ready to publish, zip the contents of the project directory (excluding development files like `.git/`) and upload it to the Chrome Web Store.

---

Feel free to customize names, icons, and functionality. 