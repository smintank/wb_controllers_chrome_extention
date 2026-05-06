export function renderDeviceList(list, devices, options = {}) {
  const { noDevicesText = "" } = options;
  const sortedDevices = [...devices].sort((left, right) => left.serial.localeCompare(right.serial));

  list.innerHTML = "";

  if (sortedDevices.length === 0) {
    const emptyState = document.createElement("i");
    emptyState.textContent = noDevicesText;
    list.append(emptyState);
    return;
  }

  for (const device of sortedDevices) {
    const row = document.createElement("li");
    const status = document.createElement("span");
    const primary = document.createElement("a");
    const label = document.createElement("span");
    const sshAction = document.createElement("a");
    const sshIcon = document.createElement("img");
    const menuAction = document.createElement("button");

    row.className = "device-row";
    row.dataset.hostname = device.hostname;
    row.classList.add("status-checking");
    status.className = "status status-gray";
    primary.className = "device-primary";
    primary.href = `http://${device.hostname}/`;
    primary.target = "_blank";
    primary.rel = "noopener noreferrer";
    label.className = "device-name";
    label.textContent = device.serial;
    sshAction.className = "device-ssh-action";
    sshAction.href = `ssh://root@${device.hostname}`;
    sshAction.target = "_blank";
    sshAction.rel = "noopener noreferrer";
    sshIcon.src = "assets/ssh.svg";
    sshIcon.alt = "SSH";
    menuAction.className = "device-menu-action";
    menuAction.type = "button";
    menuAction.hidden = true;

    primary.append(label);
    sshAction.append(sshIcon);
    row.append(status, primary, sshAction, menuAction);
    list.append(row);
  }
}
