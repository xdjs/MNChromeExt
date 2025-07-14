document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('sample-option');

  // Load saved setting
  chrome.storage.sync.get(['sampleOptionEnabled'], ({ sampleOptionEnabled }) => {
    checkbox.checked = !!sampleOptionEnabled;
  });

  checkbox.addEventListener('change', () => {
    chrome.storage.sync.set({ sampleOptionEnabled: checkbox.checked });
  });
}); 