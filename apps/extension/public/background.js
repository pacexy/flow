// A generic browser action handler for both Chrome and Firefox,
// and for both Manifest V2 and V3.

// Check if the 'browser' namespace is available, otherwise fall back to 'chrome'.
const api = typeof browser !== 'undefined' ? browser : chrome;

// In Manifest V3, the 'action' API replaced 'browserAction'.
// This checks for the existence of 'action' and falls back to 'browserAction' for V2.
const actionApi = api.action || api.browserAction;

actionApi.onClicked.addListener((tab) => {
  // Use the 'tabs' API from the detected namespace.
  api.tabs.create({
    url: 'index.html',
    // Open the new tab next to the current one.
    index: tab.index + 1,
  });
});
