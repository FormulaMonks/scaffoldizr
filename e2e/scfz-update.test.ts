import { describe, expect, test } from "bun:test";
import { spawn } from "bun";

describe("e2e: scfz update", () => {
    test("should report up-to-date when versions match", async () => {
        expect(process.env.TESTED_VERSION).toBeDefined();
        const currentVersion = process.env.TESTED_VERSION as string;
        const proc = spawn(["dist/scfz", "update"], {
            env: {
                ...process.env,
                SCFZ_FORCE_UPDATE_VERSION: currentVersion,
            },
        });

        const stdout = await new Response(proc.stdout).text();
        await proc.exited;

        expect(proc.exitCode).toBe(0);
        expect(stdout).toContain("already up to date");
    });

    test("should announce update without running installer in test mode", async () => {
        const proc = spawn(["dist/scfz", "update"], {
            env: {
                ...process.env,
                SCFZ_FORCE_UPDATE_VERSION: "v999.999.999",
                SCFZ_SKIP_UPDATE_INSTALL: "1",
            },
        });

        const stdout = await new Response(proc.stdout).text();
        await proc.exited;

        expect(proc.exitCode).toBe(0);
        expect(stdout).toContain("Updating scfz from");
        expect(stdout).toContain("Skipping install script in test mode.");
    });
});
