// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { applyDeviceStatus, refreshDeviceStatuses } from "../src/popup-status.js";

function createRow(serial) {
  const row = document.createElement("li");
  row.className = "device-row status-checking";
  row.dataset.serial = serial;

  const dot = document.createElement("span");
  dot.className = "status status-gray";
  row.append(dot);

  return row;
}

describe("applyDeviceStatus", () => {
  let row;

  beforeEach(() => {
    row = createRow("AB12CD34");
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
    const firstRow = createRow("AB12CD34");
    const secondRow = createRow("EF56GH78");
    const rowsBySerial = { AB12CD34: firstRow, EF56GH78: secondRow };
    const resolutions = [];
    const visibleRows = () => [firstRow, secondRow].filter((row) => row.style.display !== "none");

    const refreshPromise = refreshDeviceStatuses({
      devices: [
        { serial: "AB12CD34", origin: "http://wirenboard-ab12cd34.local" },
        { serial: "EF56GH78", origin: "http://wirenboard-ef56gh78.local" }
      ],
      findRow(device) {
        return rowsBySerial[device.serial];
      },
      onlineOnly: true,
      checkOnline(device) {
        return new Promise((resolve) => {
          resolutions.push({ serial: device.serial, resolve });
        });
      }
    });

    expect(firstRow.classList.contains("status-checking")).toBe(true);
    expect(secondRow.classList.contains("status-checking")).toBe(true);
    expect(visibleRows()).toHaveLength(2);

    resolutions.find(({ serial }) => serial === "EF56GH78")?.resolve(false);
    await Promise.resolve();

    expect(secondRow.classList.contains("status-offline")).toBe(true);
    expect(secondRow.style.display).toBe("none");
    expect(firstRow.classList.contains("status-checking")).toBe(true);
    expect(visibleRows()).toHaveLength(1);

    resolutions.find(({ serial }) => serial === "AB12CD34")?.resolve(true);
    await refreshPromise;

    expect(firstRow.classList.contains("status-online")).toBe(true);
    expect(firstRow.style.display).toBe("");
    expect(visibleRows()).toHaveLength(1);
  });
});
