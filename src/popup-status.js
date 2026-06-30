const STATUS_CLASS_BY_STATE = {
  checking: "status-checking",
  online: "status-online",
  offline: "status-offline"
};

const DOT_CLASS_BY_STATE = {
  checking: "status-gray",
  online: "status-green",
  offline: "status-red"
};

export function applyDeviceStatus(row, state, onlineOnly) {
  row.classList.remove("status-checking", "status-online", "status-offline");
  row.classList.add(STATUS_CLASS_BY_STATE[state]);

  const dot = row.querySelector(".status");
  if (dot) {
    dot.classList.remove("status-gray", "status-green", "status-red");
    dot.classList.add(DOT_CLASS_BY_STATE[state]);
  }

  if (onlineOnly && state === "offline") {
    row.style.display = "none";
    return;
  }

  row.style.display = "";
}

export async function refreshDeviceStatuses({ devices, findRow, onlineOnly, checkOnline }) {
  const updates = devices.map(async (device) => {
    const row = findRow(device);
    if (!row) return;

    const isOnline = await checkOnline(device);
    applyDeviceStatus(row, isOnline ? "online" : "offline", onlineOnly);
  });

  await Promise.all(updates);
}
