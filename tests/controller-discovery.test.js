import { describe, expect, it } from "vitest";

import {
  discoverControllerFromUrl,
  extractSerialFromWirenBoardHost,
  normalizeStoredDevices
} from "../src/controller-discovery.js";

describe("discoverControllerFromUrl", () => {
  it("сохраняет фактический https-origin удаленного URL и выводит SSH на IP", () => {
    expect(
      discoverControllerFromUrl("https://192-168-1-157.amkfevl4.ip.wirenboard.com/#/devices")
    ).toEqual({
      serial: "AMKFEVL4",
      origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com",
      sshHost: "192.168.1.157"
    });
  });

  it("отбрасывает нестандартный порт — контроллер всегда на дефолтном порту в корне", () => {
    expect(
      discoverControllerFromUrl("https://10-11-12-13.ab12cd34.ip.wirenboard.com:8443/")
    ).toEqual({
      serial: "AB12CD34",
      origin: "https://10-11-12-13.ab12cd34.ip.wirenboard.com",
      sshHost: "10.11.12.13"
    });
  });

  it("отбрасывает порт и подпуть стороннего сервиса на том же контроллере", () => {
    expect(
      discoverControllerFromUrl("https://192-168-1-157.amkfevl4.ip.wirenboard.com:3000/grafana/d/x")
    ).toEqual({
      serial: "AMKFEVL4",
      origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com",
      sshHost: "192.168.1.157"
    });
  });

  it("для локального URL хранит http .local origin и SSH на .local, нормализует serial", () => {
    expect(discoverControllerFromUrl("http://wirenboard-Ab12cD34.local/settings")).toEqual({
      serial: "AB12CD34",
      origin: "http://wirenboard-ab12cd34.local",
      sshHost: "wirenboard-ab12cd34.local"
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

describe("normalizeStoredDevices", () => {
  it("оставляет запись нового формата как есть и не помечает изменений", () => {
    const raw = {
      AMKFEVL4: {
        serial: "AMKFEVL4",
        origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com",
        sshHost: "192.168.1.157",
        lastSeen: 100
      }
    };

    const result = normalizeStoredDevices(raw);

    expect(result.changed).toBe(false);
    expect(result.devices).toEqual({
      AMKFEVL4: {
        serial: "AMKFEVL4",
        origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com",
        sshHost: "192.168.1.157",
        lastSeen: 100
      }
    });
  });

  it("мигрирует запись старого формата (ключ .local, без origin) в формат по serial", () => {
    const raw = {
      "wirenboard-ab12cd34.local": { serial: "AB12CD34", lastSeen: 50, online: false }
    };

    const result = normalizeStoredDevices(raw);

    expect(result.changed).toBe(true);
    expect(result.devices).toEqual({
      AB12CD34: {
        serial: "AB12CD34",
        origin: "http://wirenboard-ab12cd34.local",
        sshHost: "wirenboard-ab12cd34.local",
        lastSeen: 50
      }
    });
  });

  it("схлопывает старую и новую записи одного контроллера, оставляя самую свежую", () => {
    const raw = {
      "wirenboard-amkfevl4.local": { serial: "AMKFEVL4", lastSeen: 10, online: false },
      AMKFEVL4: {
        serial: "AMKFEVL4",
        origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com",
        sshHost: "192.168.1.157",
        lastSeen: 99
      }
    };

    const result = normalizeStoredDevices(raw);

    expect(result.changed).toBe(true);
    expect(Object.keys(result.devices)).toEqual(["AMKFEVL4"]);
    expect(result.devices.AMKFEVL4.origin).toBe(
      "https://192-168-1-157.amkfevl4.ip.wirenboard.com"
    );
    expect(result.devices.AMKFEVL4.lastSeen).toBe(99);
  });

  it("убирает порт из ранее сохраненного origin (самолечение)", () => {
    const raw = {
      AMKFEVL4: {
        serial: "AMKFEVL4",
        origin: "https://192-168-1-157.amkfevl4.ip.wirenboard.com:8443",
        sshHost: "192.168.1.157",
        lastSeen: 100
      }
    };

    const result = normalizeStoredDevices(raw);

    expect(result.changed).toBe(true);
    expect(result.devices.AMKFEVL4.origin).toBe(
      "https://192-168-1-157.amkfevl4.ip.wirenboard.com"
    );
  });

  it("отбрасывает мусорные записи без распознаваемого serial", () => {
    const raw = {
      "not-a-controller": { lastSeen: 1 },
      AB12CD34: {
        serial: "AB12CD34",
        origin: "http://wirenboard-ab12cd34.local",
        sshHost: "wirenboard-ab12cd34.local",
        lastSeen: 5
      }
    };

    const result = normalizeStoredDevices(raw);

    expect(result.changed).toBe(true);
    expect(Object.keys(result.devices)).toEqual(["AB12CD34"]);
  });
});
