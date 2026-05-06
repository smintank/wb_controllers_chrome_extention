
import { extractSerialFromWirenBoardHost } from "./src/controller-discovery.js";
import { getPopupCopy } from "./src/popup-copy.js";
import { applyDeviceStatus, refreshDeviceStatuses } from "./src/popup-status.js";
import { renderDeviceList } from "./src/popup-view.js";

const t = getPopupCopy(navigator.language);

const list = document.getElementById("device-list");
const title = document.getElementById("title");
const toggle = document.getElementById("online-only");
const label = document.getElementById("online-label");

document.title = t.popupTitle;
if (title) title.innerText = t.title;
if (label) label.innerText = t.onlineOnly;

function renderDevices(onlineOnly = false) {
  chrome.storage.local.get("devices", (data) => {
    const devices = data.devices || {};
    const entries = Object.entries(devices);
    const renderableDevices = [];

    for (const [hostname, info] of entries) {
      const serial = extractSerialFromWirenBoardHost(hostname);
      if (!serial) continue;

      renderableDevices.push({
        hostname,
        serial,
        lastSeen: info.lastSeen ?? 0
      });
    }

    renderDeviceList(list, renderableDevices, {
      noDevicesText: t.noDevices,
      deleteText: t.delete,
      menuLabel: t.moreActions,
      onDelete: (hostname) => deleteDevice(hostname, onlineOnly)
    });

    for (const device of renderableDevices) {
      const row = list.querySelector(`[data-hostname="${CSS.escape(device.hostname)}"]`);
      if (row) {
        applyDeviceStatus(row, "checking", onlineOnly);
      }
    }

    void refreshDeviceStatuses({
      devices: renderableDevices,
      findRowByHostname(hostname) {
        return list.querySelector(`[data-hostname="${CSS.escape(hostname)}"]`);
      },
      onlineOnly,
      checkOnline: checkOnlineStatus
    });
  });
}

function deleteDevice(hostname, onlineOnly) {
  chrome.storage.local.get("devices", (data) => {
    const devices = data.devices || {};
    delete devices[hostname];
    chrome.storage.local.set({ devices }, () => renderDevices(onlineOnly));
  });
}

function checkOnlineStatus(hostname) {
  return fetch(`http://${hostname}/`, { method: "GET", mode: "no-cors" })
    .then(() => true)
    .catch(() => false);
}

toggle?.addEventListener("change", () => renderDevices(toggle.checked));
document.addEventListener("DOMContentLoaded", () => renderDevices());
