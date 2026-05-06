// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { applyDeviceStatus, refreshDeviceStatuses } from "../src/popup-status.js";

function createRow(hostname) {
  const row = document.createElement("li");
  row.className = "device-row status-checking";
  row.dataset.hostname = hostname;

  const dot = document.createElement("span");
  dot.className = "status status-gray";
  row.append(dot);

  return row;
}

describe("applyDeviceStatus", () => {
  let row;

  beforeEach(() => {
    row = createRow("wirenboard-ab12cd34.local");
  });

  it("держит строку в состоянии checking до результата проверки", () => {
    applyDeviceStatus(row, "checking", false);

    expect(row.classList.contains("status-checking")).toBe(true);
    expect(row.classList.contains("status-online")).toBe(false);
    expect(row.classList.contains("status-offline")).toBe(false);
    expect(row.style.display).toBe("");
    expect(row.querySelector(".status")?.className).toContain("status-gray");
  });

  it("переводит строку в online и показывает ее при onlineOnly", () => {
    applyDeviceStatus(row, "online", true);

    expect(row.classList.contains("status-online")).toBe(true);
    expect(row.classList.contains("status-checking")).toBe(false);
    expect(row.classList.contains("status-offline")).toBe(false);
    expect(row.style.display).toBe("");
    expect(row.querySelector(".status")?.className).toContain("status-green");
  });

  it("переводит строку в offline и скрывает ее при onlineOnly", () => {
    applyDeviceStatus(row, "offline", true);

    expect(row.classList.contains("status-offline")).toBe(true);
    expect(row.classList.contains("status-checking")).toBe(false);
    expect(row.classList.contains("status-online")).toBe(false);
    expect(row.style.display).toBe("none");
    expect(row.querySelector(".status")?.className).toContain("status-red");
  });
});

describe("refreshDeviceStatuses", () => {
  it("обновляет строки асинхронно по мере прихода результатов, не дожидаясь всех проверок", async () => {
    const firstRow = createRow("wirenboard-ab12cd34.local");
    const secondRow = createRow("wirenboard-ef56gh78.local");
    const resolutions = [];
    const visibleRows = () => [firstRow, secondRow].filter((row) => row.style.display !== "none");

    const refreshPromise = refreshDeviceStatuses({
      devices: [
        { hostname: "wirenboard-ab12cd34.local" },
        { hostname: "wirenboard-ef56gh78.local" }
      ],
      findRowByHostname(hostname) {
        return hostname === "wirenboard-ab12cd34.local" ? firstRow : secondRow;
      },
      onlineOnly: true,
      checkOnline(hostname) {
        return new Promise((resolve) => {
          resolutions.push({ hostname, resolve });
        });
      }
    });

    expect(firstRow.classList.contains("status-checking")).toBe(true);
    expect(secondRow.classList.contains("status-checking")).toBe(true);
    expect(visibleRows()).toHaveLength(2);

    resolutions.find(({ hostname }) => hostname === "wirenboard-ef56gh78.local")?.resolve(false);
    await Promise.resolve();

    expect(secondRow.classList.contains("status-offline")).toBe(true);
    expect(secondRow.style.display).toBe("none");
    expect(firstRow.classList.contains("status-checking")).toBe(true);
    expect(visibleRows()).toHaveLength(1);

    resolutions.find(({ hostname }) => hostname === "wirenboard-ab12cd34.local")?.resolve(true);
    await refreshPromise;

    expect(firstRow.classList.contains("status-online")).toBe(true);
    expect(firstRow.style.display).toBe("");
    expect(visibleRows()).toHaveLength(1);
  });
});
