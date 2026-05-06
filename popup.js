
// Wirenboard Chrome Extension v2 (popup.js)

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


function createDeviceElement(serial, hostname, isOnline) {
  const li = document.createElement("li");
  li.className = isOnline ? "online" : "offline";

  const dot = document.createElement("span");
  dot.className = isOnline ? "status green" : "status red";

  const input = document.createElement("input");
  input.value = name || serial;
  input.title = `http://${hostname}/`;
  input.className = "device-name";
  input.placeholder = t.placeholder;
  input.disabled = true;

  const deleteBtn = document.createElement("span");
  deleteBtn.innerText = "❌";
  deleteBtn.className = "icon-button";
  deleteBtn.title = t.cancel;

  const link = document.createElement("a");
  link.href = `http://${hostname}/`;
  link.target = "_blank";
  link.className = "device-link";
  const wrapper = document.createElement("div");
  wrapper.className = "device-wrapper";
  wrapper.appendChild(link);
  wrapper.appendChild(input);

  deleteBtn.onclick = () => {
    chrome.storage.local.get("devices", (data) => {
      const devices = data.devices || {};
      delete devices[hostname];
      chrome.storage.local.set({ devices }, () => li.remove());
    });
  }

  li.append(dot, wrapper, deleteBtn);
  return li;
}

function renderDevices(onlineOnly = false) {
  chrome.storage.local.get("devices", (data) => {
    const devices = data.devices || {};
    list.innerHTML = "";

    const entries = Object.entries(devices);
    if (entries.length === 0) {
      list.innerHTML = `<i>${t.noDevices}</i>`;
      return;
    }

    for (const [hostname, info] of entries) {
      const serial = extractSerial(hostname);
      if (!serial) continue;

      // показываем сразу с offline (серым) статусом
      const el = createDeviceElement(serial, hostname, false);
      list.appendChild(el);

      // асинхронно проверяем статус
      checkOnlineStatus(hostname, el, onlineOnly);
    }
  });
}

function checkOnlineStatus(hostname, li, onlineOnly) {
  fetch(`http://${hostname}/`, { method: "GET", mode: "no-cors" })
    .then(() => {
      li.classList.remove("offline");
      li.classList.add("online");

      const dot = li.querySelector(".status");
      if (dot) {
        dot.classList.remove("red");
        dot.classList.add("green");
      }

      // Если включён фильтр "только онлайн", и элемент был изначально false
      if (onlineOnly) {
        li.style.display = ""; // показать
      }
    })
    .catch(() => {
      if (onlineOnly) {
        li.style.display = "none"; // скрыть, если offline
      }
    });
}

toggle?.addEventListener("change", () => renderDevices(toggle.checked));
document.addEventListener("DOMContentLoaded", () => renderDevices());
