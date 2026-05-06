export function renderDeviceList(list, devices, options = {}) {
  const { noDevicesText = "", deleteText = "Delete", menuLabel = "More", onDelete = null } = options;
  const sortedDevices = [...devices].sort((left, right) => left.serial.localeCompare(right.serial));
  let openMenu = null;
  const { ownerDocument } = list;

  function hideOpenMenu() {
    if (!openMenu) return;
    openMenu.hidden = true;
    openMenu = null;
  }

  list.innerHTML = "";
  if (list._outsideClickHandler) {
    ownerDocument.removeEventListener("click", list._outsideClickHandler);
  }

  list._outsideClickHandler = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      hideOpenMenu();
      return;
    }

    if (target.closest(".device-menu") || target.closest(".device-menu-action")) {
      return;
    }

    hideOpenMenu();
  };

  ownerDocument.addEventListener("click", list._outsideClickHandler);

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
    const menu = document.createElement("div");
    const deleteAction = document.createElement("button");

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
    menuAction.textContent = "⋯";
    menuAction.setAttribute("aria-label", menuLabel);
    menu.hidden = true;
    menu.className = "device-menu";
    deleteAction.className = "device-delete-action";
    deleteAction.type = "button";
    deleteAction.textContent = deleteText;

    menuAction.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (openMenu && openMenu !== menu) {
        openMenu.hidden = true;
      }

      const shouldOpen = menu.hidden;
      hideOpenMenu();
      menu.hidden = !shouldOpen;
      openMenu = shouldOpen ? menu : null;
    });

    deleteAction.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideOpenMenu();
      if (typeof onDelete === "function") {
        onDelete(device.hostname);
      }
    });

    primary.append(label);
    sshAction.append(sshIcon);
    menu.append(deleteAction);
    row.append(status, primary, sshAction, menuAction, menu);
    list.append(row);
  }
}
