import { describe, expect, it } from "vitest";

import { getPopupCopy, popupCopy } from "../src/popup-copy.js";

describe("popup copy", () => {
  it("объясняет в пустом состоянии, что контроллер появится после открытия web UI", () => {
    expect(popupCopy.ru.noDevices).toContain("web UI");
    expect(popupCopy.ru.noDevices).toContain("появится");
    expect(popupCopy.en.noDevices).toContain("web UI");
    expect(popupCopy.en.noDevices).toContain("appear");
  });

  it("содержит полный и согласованный набор строк для RU и EN", () => {
    expect(Object.keys(popupCopy.ru).sort()).toEqual(Object.keys(popupCopy.en).sort());
    expect(popupCopy.ru).toMatchObject({
      title: expect.any(String),
      popupTitle: expect.any(String),
      onlineOnly: expect.any(String),
      noDevices: expect.any(String),
      delete: expect.any(String),
      moreActions: expect.any(String)
    });
  });

  it("возвращает русский набор строк для ru-* locale и английский для остальных", () => {
    expect(getPopupCopy("ru-RU")).toBe(popupCopy.ru);
    expect(getPopupCopy("ru")).toBe(popupCopy.ru);
    expect(getPopupCopy("en-US")).toBe(popupCopy.en);
    expect(getPopupCopy("es-ES")).toBe(popupCopy.en);
  });
});
