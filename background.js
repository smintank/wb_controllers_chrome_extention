import { discoverControllerFromUrl } from "./src/controller-discovery.js";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const controller = discoverControllerFromUrl(tab.url);
  if (!controller) return;

  chrome.storage.local.get(["devices"], (data) => {
    const devices = data.devices || {};
    devices[controller.hostname] = {
      serial: controller.serial,
      lastSeen: Date.now(),
      online: false
    };
    chrome.storage.local.set({ devices });
  });
});
