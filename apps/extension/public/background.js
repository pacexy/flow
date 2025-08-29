chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    url: 'index.html',
    index: tab.index + 1
  });
});
