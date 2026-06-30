import {
  discoverControllerFromUrl,
  extractSerialFromWirenBoardHost
} from "./src/controller-discovery.js";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const controller = discoverControllerFromUrl(tab.url);
  if (!controller) return;

  chrome.storage.local.get(["devices"], (data) => {
    const devices = data.devices || {};

    // Drop any legacy/duplicate entry for the same controller (e.g. one keyed
    // by .local hostname, or a stale address from a previous IP) so each
    // controller keeps a single entry pointing at the address last visited.
    for (const key of Object.keys(devices)) {
      if (key === controller.serial) continue;
      const existingSerial = devices[key]?.serial || extractSerialFromWirenBoardHost(key);
      if (existingSerial === controller.serial) {
        delete devices[key];
      }
    }

    devices[controller.serial] = {
      serial: controller.serial,
      origin: controller.origin,
      sshHost: controller.sshHost,
      lastSeen: Date.now()
    };
    chrome.storage.local.set({ devices });
  });
});
