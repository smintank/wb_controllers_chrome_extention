// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { renderDeviceList } from "../src/popup-view.js";

describe("renderDeviceList", () => {
  it("показывает пустое состояние, если контроллеров нет", () => {
    const list = document.createElement("ul");

    renderDeviceList(list, [], {
      noDevicesText: "Контроллеры ещё не добавлены. Зайдите на один — и он появится здесь."
    });

    expect(list.textContent).toContain(
      "Контроллеры ещё не добавлены. Зайдите на один — и он появится здесь."
    );
    expect(list.querySelectorAll("li")).toHaveLength(0);
  });

  it("рендерит строку контроллера по serial без несуществующих полей", () => {
    const list = document.createElement("ul");

    renderDeviceList(
      list,
      [
        {
          hostname: "wirenboard-a1b2c3d4.local",
          serial: "A1B2C3D4"
        }
      ],
      {}
    );

    const rows = list.querySelectorAll("li");
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain("A1B2C3D4");
    expect(rows[0].querySelector("input")).toBeNull();
  });

  it("сортирует контроллеры по serial", () => {
    const list = document.createElement("ul");

    renderDeviceList(
      list,
      [
        {
          hostname: "wirenboard-b1b2c3d4.local",
          serial: "B1B2C3D4"
        },
        {
          hostname: "wirenboard-a1b2c3d4.local",
          serial: "A1B2C3D4"
        }
      ],
      {}
    );

    const labels = [...list.querySelectorAll(".device-name")].map((node) => node.textContent);

    expect(labels).toEqual(["A1B2C3D4", "B1B2C3D4"]);
  });

  it("создает отдельные зоны строки для primary area, SSH и overflow", () => {
    const list = document.createElement("ul");

    renderDeviceList(
      list,
      [
        {
          hostname: "wirenboard-a1b2c3d4.local",
          serial: "A1B2C3D4"
        }
      ],
      {}
    );

    const row = list.querySelector("li");

    expect(row?.querySelector(".device-primary")).not.toBeNull();
    expect(row?.querySelector(".device-ssh-action")).not.toBeNull();
    expect(row?.querySelector(".device-menu-action")).not.toBeNull();
  });

  it("делает основную зону строки ссылкой на web UI контроллера", () => {
    const list = document.createElement("ul");

    renderDeviceList(
      list,
      [
        {
          hostname: "wirenboard-a1b2c3d4.local",
          serial: "A1B2C3D4"
        }
      ],
      {}
    );

    const primaryLink = list.querySelector(".device-primary");

    expect(primaryLink?.tagName).toBe("A");
    expect(primaryLink?.getAttribute("href")).toBe("http://wirenboard-a1b2c3d4.local/");
    expect(primaryLink?.getAttribute("target")).toBe("_blank");
    expect(primaryLink?.textContent).toContain("A1B2C3D4");
  });
});
