// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { popupCopy } from "../src/popup-copy.js";
import { renderDeviceList } from "../src/popup-view.js";

function remoteDevice(serial, lastOctet) {
  return {
    serial,
    origin: `https://192-168-1-${lastOctet}.${serial.toLowerCase()}.ip.wirenboard.com`,
    sshHost: `192.168.1.${lastOctet}`
  };
}

describe("renderDeviceList", () => {
  it("показывает пустое состояние, если контроллеров нет", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [], {
      noDevicesText: popupCopy.ru.noDevices
    });

    expect(list.textContent).toContain(popupCopy.ru.noDevices);
    expect(list.textContent).toContain("web UI");
    expect(list.querySelectorAll("li")).toHaveLength(0);
  });

  it("рендерит строку контроллера по serial без несуществующих полей", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {});

    const rows = list.querySelectorAll("li");
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain("A1B2C3D4");
    expect(rows[0].dataset.serial).toBe("A1B2C3D4");
    expect(rows[0].querySelector("input")).toBeNull();
  });

  it("сортирует контроллеры по serial", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("B1B2C3D4", 11), remoteDevice("A1B2C3D4", 12)], {});

    const labels = [...list.querySelectorAll(".device-name")].map((node) => node.textContent);

    expect(labels).toEqual(["A1B2C3D4", "B1B2C3D4"]);
  });

  it("создает отдельные зоны строки для primary area, SSH и overflow", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {});

    const row = list.querySelector("li");

    expect(row?.querySelector(".device-primary")).not.toBeNull();
    expect(row?.querySelector(".device-ssh-action")).not.toBeNull();
    expect(row?.querySelector(".device-menu-action")).not.toBeNull();
  });

  it("ведет основную зону строки на сохраненный origin контроллера", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {});

    const primaryLink = list.querySelector(".device-primary");
    const status = primaryLink?.querySelector(".status");

    expect(primaryLink?.tagName).toBe("A");
    expect(primaryLink?.getAttribute("href")).toBe(
      "https://192-168-1-157.a1b2c3d4.ip.wirenboard.com/"
    );
    expect(primaryLink?.getAttribute("target")).toBe("_blank");
    expect(status).not.toBeNull();
    expect(primaryLink?.textContent).toContain("A1B2C3D4");
  });

  it("ведет основную зону строки на http .local origin для локального контроллера", () => {
    const list = document.createElement("ul");

    renderDeviceList(
      list,
      [
        {
          serial: "A1B2C3D4",
          origin: "http://wirenboard-a1b2c3d4.local",
          sshHost: "wirenboard-a1b2c3d4.local"
        }
      ],
      {}
    );

    const primaryLink = list.querySelector(".device-primary");
    expect(primaryLink?.getAttribute("href")).toBe("http://wirenboard-a1b2c3d4.local/");
  });

  it("рендерит отдельное SSH-действие на sshHost с локальной SVG-иконкой", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {});

    const sshAction = list.querySelector(".device-ssh-action");
    const sshIcon = sshAction?.querySelector("img");

    expect(sshAction?.tagName).toBe("A");
    expect(sshAction?.getAttribute("href")).toBe("ssh://root@192.168.1.157");
    expect(sshAction?.getAttribute("target")).toBe("_blank");
    expect(sshIcon?.getAttribute("src")).toBe("assets/ssh.svg");
    expect(sshIcon?.getAttribute("alt")).toBe("SSH");
  });

  it("раскрывает overflow-меню и отдает serial удаляемого контроллера", () => {
    const list = document.createElement("ul");
    const onDelete = vi.fn();

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {
      deleteText: "Удалить",
      menuLabel: "Ещё",
      onDelete
    });

    const menuAction = list.querySelector(".device-menu-action");
    const menu = list.querySelector(".device-menu");

    expect(menuAction?.hidden).toBe(false);
    expect(menu?.hidden).toBe(true);

    menuAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const deleteAction = list.querySelector(".device-delete-action");

    expect(menu?.hidden).toBe(false);
    expect(deleteAction?.textContent).toContain("Удалить");

    deleteAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onDelete).toHaveBeenCalledWith("A1B2C3D4");
  });

  it("закрывает открытое меню по клику в пустое место списка", () => {
    const container = document.createElement("div");
    const list = document.createElement("ul");
    const emptySpace = document.createElement("div");

    container.append(list, emptySpace);
    document.body.append(container);

    renderDeviceList(list, [remoteDevice("A1B2C3D4", 157)], {
      deleteText: "Удалить",
      menuLabel: "Ещё"
    });

    const menuAction = list.querySelector(".device-menu-action");
    const menu = list.querySelector(".device-menu");

    menuAction?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menu?.hidden).toBe(false);

    emptySpace.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(menu?.hidden).toBe(true);
  });

  it("держит открытым только одно overflow-меню одновременно", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [remoteDevice("B1B2C3D4", 11), remoteDevice("A1B2C3D4", 12)], {
      deleteText: "Удалить",
      menuLabel: "Ещё"
    });

    const menuActions = [...list.querySelectorAll(".device-menu-action")];
    const menus = [...list.querySelectorAll(".device-menu")];

    menuActions[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menus[0]?.hidden).toBe(false);
    expect(menus[1]?.hidden).toBe(true);

    menuActions[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menus[0]?.hidden).toBe(true);
    expect(menus[1]?.hidden).toBe(false);
  });
});
