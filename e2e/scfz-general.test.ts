import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "bun";

const UPDATE_CACHE_FILE = ".scaffoldizr-update.json";

async function createTempHome(): Promise<string> {
    return mkdtemp(join(tmpdir(), "scaffoldizr-e2e-home-"));
}

async function writeUpdateCache(homeDir: string, latestVersion: string) {
    await writeFile(
        join(homeDir, UPDATE_CACHE_FILE),
        JSON.stringify({ latestVersion, checkedAt: Date.now() }),
        "utf8",
    );
}

describe("scfz: general", () => {
    test("@smoke: should return the correct version", async () => {
        const proc = spawn(["dist/scfz", "--version"]);
        const text = await new Response(proc.stdout).text();

        expect(process.env.TESTED_VERSION).toBeDefined();
        expect(text.trim()).toEqual(process.env.TESTED_VERSION as string);
    });

    describe("--version update notification", () => {
        let temporaryHomeDirectory: string;

        beforeEach(async () => {
            temporaryHomeDirectory = await createTempHome();
        });

        afterEach(async () => {
            await rm(temporaryHomeDirectory, { recursive: true, force: true });
        });

        test("shows update notification when a newer version is cached", async () => {
            await writeUpdateCache(temporaryHomeDirectory, "999.999.999");

            const proc = spawn(["dist/scfz", "--version"], {
                env: {
                    ...process.env,
                    HOME: temporaryHomeDirectory,
                    SCFZ_FORCE_UPDATE_CHECK: "1",
                },
            });
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;

            expect(proc.exitCode).toBe(0);
            expect(stdout).toContain("Update available");
            expect(stdout).toContain("999.999.999");
        });

        test("does not show update notification when version is current", async () => {
            expect(process.env.TESTED_VERSION).toBeDefined();
            await writeUpdateCache(
                temporaryHomeDirectory,
                process.env.TESTED_VERSION as string,
            );

            const proc = spawn(["dist/scfz", "--version"], {
                env: {
                    ...process.env,
                    HOME: temporaryHomeDirectory,
                    SCFZ_FORCE_UPDATE_CHECK: "1",
                },
            });
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;

            expect(proc.exitCode).toBe(0);
            expect(stdout).not.toContain("Update available");
        });

        test("does not show update notification when SCFZ_NO_UPDATE_CHECK is set", async () => {
            await writeUpdateCache(temporaryHomeDirectory, "999.999.999");

            const proc = spawn(["dist/scfz", "--version"], {
                env: {
                    ...process.env,
                    HOME: temporaryHomeDirectory,
                    SCFZ_FORCE_UPDATE_CHECK: "1",
                    SCFZ_NO_UPDATE_CHECK: "1",
                },
            });
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;

            expect(proc.exitCode).toBe(0);
            expect(stdout).not.toContain("Update available");
        });
    });
});
