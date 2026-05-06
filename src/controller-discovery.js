const LOCAL_HOST_PATTERN = /^wirenboard-([a-zA-Z0-9]{8})\.local$/;
const REMOTE_HOST_PATTERN = /^\d+-\d+-\d+-\d+\.([a-zA-Z0-9]{8})\.ip\.wirenboard\.com$/;

function normalizeSerial(serial) {
  return serial.toUpperCase();
}

function toHostname(serial) {
  return `wirenboard-${serial.toLowerCase()}.local`;
}

export function extractSerialFromWirenBoardHost(hostname) {
  const localMatch = hostname.match(LOCAL_HOST_PATTERN);
  if (localMatch) {
    return normalizeSerial(localMatch[1]);
  }

  const remoteMatch = hostname.match(REMOTE_HOST_PATTERN);
  if (remoteMatch) {
    return normalizeSerial(remoteMatch[1]);
  }

  return null;
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
    hostname: toHostname(serial),
    serial
  };
}
