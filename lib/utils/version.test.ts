import { describe, expect, it } from "bun:test";
import {
    isNewerVersion,
    stripVersionPrefix,
    versionToSegments,
} from "./version";

describe("isNewerVersion", () => {
    it("returns true when 0.10.0 is newer than 0.9.3", () => {
        expect(isNewerVersion("0.10.0", "0.9.3")).toBe(true);
    });

    it("returns false when 0.9.3 equals 0.9.3", () => {
        expect(isNewerVersion("0.9.3", "0.9.3")).toBe(false);
    });

    it("returns false when 0.9.3 is not newer than 1.0.0", () => {
        expect(isNewerVersion("0.9.3", "1.0.0")).toBe(false);
    });

    it("returns true when 1.0.0 is newer than 0.9.3", () => {
        expect(isNewerVersion("1.0.0", "0.9.3")).toBe(true);
    });

    it("returns false for invalid version (NaN guard)", () => {
        expect(isNewerVersion("invalid", "0.9.3")).toBe(false);
    });
});

describe("versionToSegments", () => {
    it("strips v prefix and returns segments for v0.10.0", () => {
        expect(versionToSegments("v0.10.0")).toEqual([0, 10, 0]);
    });

    it("returns segments for 0.10.0 without prefix", () => {
        expect(versionToSegments("0.10.0")).toEqual([0, 10, 0]);
    });
});

describe("stripVersionPrefix", () => {
    it("strips v prefix from v1.2.3", () => {
        expect(stripVersionPrefix("v1.2.3")).toBe("1.2.3");
    });

    it("returns unchanged string when no v prefix", () => {
        expect(stripVersionPrefix("1.2.3")).toBe("1.2.3");
    });
});
