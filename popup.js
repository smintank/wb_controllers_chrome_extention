
import { renderDeviceList } from "./src/popup-view.js";

const i18n = {
  en: {
    title: "Wiren Board Local Controllers",
    onlineOnly: "Online only",
    noDevices: "No controllers added yet. Visit one to see it here.",
    cancel: "Cancel"
  },
  ru: {
    title: "Локальные контроллеры Wiren Board",
    onlineOnly: "Только онлайн",
    noDevices: "Контроллеры ещё не добавлены. Зайдите на один — и он появится здесь.",
    cancel: "Отмена"
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


function extractSerial(urlOrHostname) {
  const localMatch = urlOrHostname.match(/wirenboard-([a-zA-Z0-9]{8})\.local/);
  if (localMatch) return localMatch[1].toUpperCase();

  const domainMatch = urlOrHostname.match(/\d+-\d+-\d+-\d+\.([a-zA-Z0-9]{8})\.ip\.wirenboard\.com/);
  if (domainMatch) return domainMatch[1].toUpperCase();

  return null;
}

function renderDevices(onlineOnly = false) {
  chrome.storage.local.get("devices", (data) => {
    const devices = data.devices || {};
    const entries = Object.entries(devices);
    const renderableDevices = [];

    for (const [hostname, info] of entries) {
      const serial = extractSerial(hostname);
      if (!serial) continue;

      renderableDevices.push({
        hostname,
        serial,
        lastSeen: info.lastSeen ?? 0
      });
    }

    renderDeviceList(list, renderableDevices, {
      noDevicesText: t.noDevices
    });

    for (const device of renderableDevices) {
      const row = list.querySelector(`[data-hostname="${CSS.escape(device.hostname)}"]`);

      if (!row) continue;
      checkOnlineStatus(device.hostname, row, onlineOnly);
    }
  });
}

function checkOnlineStatus(hostname, li, onlineOnly) {
  fetch(`http://${hostname}/`, { method: "GET", mode: "no-cors" })
    .then(() => {
      li.classList.remove("status-checking", "status-offline");
      li.classList.add("status-online");

      const dot = li.querySelector(".status");
      if (dot) {
        dot.classList.remove("status-red", "status-gray");
        dot.classList.add("status-green");
      }

      if (onlineOnly) {
        li.style.display = "";
      }
    })
    .catch(() => {
      li.classList.remove("status-checking", "status-online");
      li.classList.add("status-offline");

      const dot = li.querySelector(".status");
      if (dot) {
        dot.classList.remove("status-green", "status-gray");
        dot.classList.add("status-red");
      }

      if (onlineOnly) {
        li.style.display = "none";
      }
    });
}

toggle?.addEventListener("change", () => renderDevices(toggle.checked));
document.addEventListener("DOMContentLoaded", () => renderDevices());
