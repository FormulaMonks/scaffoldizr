import { describe, expect, test } from "bun:test";
import { spawn } from "bun";

describe("scfz: general", () => {
    test("@smoke: should return the correct version", async () => {
        const proc = spawn(["dist/scfz", "--version"]);
        const text = await new Response(proc.stdout).text();

        expect(process.env.TESTED_VERSION).toBeDefined();
        expect(text.trim()).toEqual(process.env.TESTED_VERSION as string);
    });
});
