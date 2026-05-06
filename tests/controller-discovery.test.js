import { describe, expect, it } from "vitest";

import {
  discoverControllerFromUrl,
  extractSerialFromWirenBoardHost
} from "../src/controller-discovery.js";

describe("discoverControllerFromUrl", () => {
  it("распознает удаленный URL wirenboard и канонизирует hostname в .local", () => {
    expect(
      discoverControllerFromUrl("https://10-11-12-13.ab12cd34.ip.wirenboard.com/#/devices")
    ).toEqual({
      hostname: "wirenboard-ab12cd34.local",
      serial: "AB12CD34"
    });
  });

  it("распознает локальный URL wirenboard и нормализует регистр serial", () => {
    expect(
      discoverControllerFromUrl("http://wirenboard-Ab12cD34.local/settings")
    ).toEqual({
      hostname: "wirenboard-ab12cd34.local",
      serial: "AB12CD34"
    });
  });

  it("игнорирует URL, которые не совпадают с поддерживаемыми шаблонами", () => {
    expect(discoverControllerFromUrl("https://example.com/wirenboard-ab12cd34.local")).toBeNull();
    expect(discoverControllerFromUrl("https://10-11-12-13.short.ip.wirenboard.com/")).toBeNull();
  });
});

describe("extractSerialFromWirenBoardHost", () => {
  it("достает serial из локального hostname", () => {
    expect(extractSerialFromWirenBoardHost("wirenboard-ab12cd34.local")).toBe("AB12CD34");
  });

  it("достает serial из удаленного wirenboard hostname", () => {
    expect(extractSerialFromWirenBoardHost("10-11-12-13.ab12cd34.ip.wirenboard.com")).toBe(
      "AB12CD34"
    );
  });

  it("возвращает null для неподдерживаемого hostname", () => {
    expect(extractSerialFromWirenBoardHost("wirenboard-abcd.local")).toBeNull();
  });
});
