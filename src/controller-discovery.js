const LOCAL_HOST_PATTERN = /^wirenboard-([a-zA-Z0-9]{8})\.local$/;
const REMOTE_HOST_PATTERN = /^(\d+-\d+-\d+-\d+)\.([a-zA-Z0-9]{8})\.ip\.wirenboard\.com$/;

function normalizeSerial(serial) {
  return serial.toUpperCase();
}

function localHostname(serial) {
  return `wirenboard-${serial.toLowerCase()}.local`;
}

function localOrigin(serial) {
  return `http://${localHostname(serial)}`;
}

export function extractSerialFromWirenBoardHost(hostname) {
  const localMatch = hostname.match(LOCAL_HOST_PATTERN);
  if (localMatch) {
    return normalizeSerial(localMatch[1]);
  }

  const remoteMatch = hostname.match(REMOTE_HOST_PATTERN);
  if (remoteMatch) {
    return normalizeSerial(remoteMatch[2]);
  }

  return null;
}

function deriveSshHost(hostname) {
  const remoteMatch = hostname.match(REMOTE_HOST_PATTERN);
  if (remoteMatch) {
    return remoteMatch[1].replace(/-/g, ".");
  }

  // Local (.local) host: SSH target is the mDNS hostname as visited.
  return hostname;
}

export function discoverControllerFromUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const serial = extractSerialFromWirenBoardHost(url.hostname);
  if (!serial) {
    return null;
  }

  return {
    serial,
    origin: url.origin,
    sshHost: deriveSshHost(url.hostname)
  };
}

// Brings stored devices to the canonical, serial-keyed shape:
// one entry per controller, holding the exact last-visited origin and an
// SSH target. Migrates legacy entries (keyed by .local hostname, without an
// origin) and collapses duplicates of the same controller, keeping the most
// recently seen address. `changed` signals the caller to persist the result.
export function normalizeStoredDevices(rawDevices = {}) {
  const bySerial = {};
  let changed = false;

  for (const [key, info] of Object.entries(rawDevices)) {
    if (!info || typeof info !== "object") {
      changed = true;
      continue;
    }

    const serial = info.serial || extractSerialFromWirenBoardHost(key);
    if (!serial) {
      changed = true;
      continue;
    }

    let { origin, sshHost } = info;
    if (!origin || !sshHost) {
      origin = localOrigin(serial);
      sshHost = localHostname(serial);
      changed = true;
    }

    const lastSeen = info.lastSeen ?? 0;
    if (key !== serial) {
      changed = true;
    }

    const existing = bySerial[serial];
    if (existing) {
      changed = true;
      if (lastSeen < existing.lastSeen) {
        continue;
      }
    }

    bySerial[serial] = { serial, origin, sshHost, lastSeen };
  }

  return { devices: bySerial, changed };
}
