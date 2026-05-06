chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const url = new URL(tab.url);
  let match =
    url.href.match(/^https?:\/\/\d+-\d+-\d+-\d+\.([a-zA-Z0-9]{8})\.ip\.wirenboard\.com/) ||
    url.href.match(/wirenboard-([a-zA-Z0-9]{8})\.local/);

  if (!match) return;

  const serial = match[1].toUpperCase();
  const hostname = `wirenboard-${serial.toLowerCase()}.local`;

  chrome.storage.local.get(["devices"], (data) => {
    const devices = data.devices || {};
    devices[hostname] = {
      serial,
      lastSeen: Date.now(),
      online: false
    };
    chrome.storage.local.set({ devices });
  });
});
