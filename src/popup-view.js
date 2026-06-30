export function renderDeviceList(list, devices, options = {}) {
  const {
    noDevicesText = "",
    deleteText = "Delete",
    menuLabel = "More",
    copyLabel = "Copy name",
    copiedLabel = "Copied",
    onDelete = null,
    onCopy = null
  } = options;
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
    const copyAction = document.createElement("button");
    const copyIcon = document.createElement("img");
    const sshAction = document.createElement("a");
    const sshIcon = document.createElement("img");
    const menuAction = document.createElement("button");
    const menu = document.createElement("div");
    const deleteAction = document.createElement("button");

    row.className = "device-row";
    row.dataset.serial = device.serial;
    row.classList.add("status-checking");
    status.className = "status status-gray";
    primary.className = "device-primary";
    primary.href = `${device.origin}/`;
    primary.target = "_blank";
    primary.rel = "noopener noreferrer";
    label.className = "device-name";
    label.textContent = device.serial;
    copyAction.className = "device-copy-action";
    copyAction.type = "button";
    copyAction.setAttribute("aria-label", copyLabel);
    copyAction.title = copyLabel;
    copyIcon.src = "assets/copy.svg";
    copyIcon.alt = "";
    sshAction.className = "device-ssh-action";
    sshAction.href = `ssh://root@${device.sshHost}`;
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

    let copiedResetTimer = null;
    copyAction.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideOpenMenu();
      if (typeof onCopy === "function") {
        onCopy(device.serial);
      }

      copyAction.classList.add("is-copied");
      copyAction.setAttribute("aria-label", copiedLabel);
      copyAction.title = copiedLabel;
      if (copiedResetTimer) {
        clearTimeout(copiedResetTimer);
      }
      copiedResetTimer = setTimeout(() => {
        copyAction.classList.remove("is-copied");
        copyAction.setAttribute("aria-label", copyLabel);
        copyAction.title = copyLabel;
        copiedResetTimer = null;
      }, 1200);
    });

    deleteAction.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideOpenMenu();
      if (typeof onDelete === "function") {
        onDelete(device.serial);
      }
    });

    primary.append(status, label);
    copyAction.append(copyIcon);
    sshAction.append(sshIcon);
    menu.append(deleteAction);
    row.append(primary, copyAction, sshAction, menuAction, menu);
    list.append(row);
  }
}
