
import { normalizeStoredDevices } from "./src/controller-discovery.js";
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

function findRow(serial) {
  return list.querySelector(`[data-serial="${CSS.escape(serial)}"]`);
}

function renderDevices(onlineOnly = false) {
  chrome.storage.local.get("devices", (data) => {
    const { devices, changed } = normalizeStoredDevices(data.devices || {});
    if (changed) {
      chrome.storage.local.set({ devices });
    }

    const renderableDevices = Object.values(devices).map((device) => ({
      serial: device.serial,
      origin: device.origin,
      sshHost: device.sshHost,
      lastSeen: device.lastSeen ?? 0
    }));

    renderDeviceList(list, renderableDevices, {
      noDevicesText: t.noDevices,
      deleteText: t.delete,
      menuLabel: t.moreActions,
      copyLabel: t.copyName,
      copiedLabel: t.copiedName,
      onDelete: (serial) => deleteDevice(serial, onlineOnly),
      onCopy: (serial) => copyDeviceName(serial)
    });

    for (const device of renderableDevices) {
      const row = findRow(device.serial);
      if (row) {
        applyDeviceStatus(row, "checking", onlineOnly);
      }
    }

    void refreshDeviceStatuses({
      devices: renderableDevices,
      findRow: (device) => findRow(device.serial),
      onlineOnly,
      checkOnline: (device) => checkOnlineStatus(device.origin)
    });
  });
}

function deleteDevice(serial, onlineOnly) {
  chrome.storage.local.get("devices", (data) => {
    const devices = data.devices || {};
    delete devices[serial];
    chrome.storage.local.set({ devices }, () => renderDevices(onlineOnly));
  });
}

function copyDeviceName(serial) {
  return navigator.clipboard?.writeText(serial);
}

function checkOnlineStatus(origin) {
  return fetch(`${origin}/`, { method: "GET", mode: "no-cors" })
    .then(() => true)
    .catch(() => false);
}

toggle?.addEventListener("change", () => renderDevices(toggle.checked));
document.addEventListener("DOMContentLoaded", () => renderDevices());
