
import { extractSerialFromWirenBoardHost } from "./src/controller-discovery.js";
import { applyDeviceStatus, refreshDeviceStatuses } from "./src/popup-status.js";
import { renderDeviceList } from "./src/popup-view.js";

const i18n = {
  en: {
    title: "Wiren Board Local Controllers",
    onlineOnly: "Online only",
    noDevices: "No controllers added yet. Visit one to see it here.",
    delete: "Delete",
    moreActions: "More actions"
  },
  ru: {
    title: "Локальные контроллеры Wiren Board",
    onlineOnly: "Только онлайн",
    noDevices: "Контроллеры ещё не добавлены. Зайдите на один — и он появится здесь.",
    delete: "Удалить",
    moreActions: "Ещё"
  }
};

const lang = navigator.language.startsWith("ru") ? "ru" : "en";
const t = i18n[lang];

const list = document.getElementById("device-list");
const title = document.getElementById("title");
const toggle = document.getElementById("online-only");
const label = document.getElementById("online-label");

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
