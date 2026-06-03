import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "bun";

const UPDATE_CACHE_FILE = ".scaffoldizr-update.json";

async function createTempCacheDir(): Promise<string> {
    return mkdtemp(join(tmpdir(), "scaffoldizr-e2e-cache-"));
}

async function writeUpdateCache(cacheDir: string, latestVersion: string) {
    await writeFile(
        join(cacheDir, UPDATE_CACHE_FILE),
        JSON.stringify({ latestVersion, checkedAt: Date.now() }),
        "utf8",
    );
}

describe("scfz: --version update notification", () => {
    let temporaryCacheDirectory: string;

    beforeEach(async () => {
        temporaryCacheDirectory = await createTempCacheDir();
    });

    afterEach(async () => {
        await rm(temporaryCacheDirectory, { recursive: true, force: true });
    });

    test("shows update notification when a newer version is cached", async () => {
        await writeUpdateCache(temporaryCacheDirectory, "999.999.999");

        const proc = spawn(["dist/scfz", "--version"], {
            env: {
                ...process.env,
                SCFZ_UPDATE_CACHE_DIR: temporaryCacheDirectory,
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
            temporaryCacheDirectory,
            process.env.TESTED_VERSION as string,
        );

        const proc = spawn(["dist/scfz", "--version"], {
            env: {
                ...process.env,
                SCFZ_UPDATE_CACHE_DIR: temporaryCacheDirectory,
                SCFZ_FORCE_UPDATE_CHECK: "1",
            },
        });
        const stdout = await new Response(proc.stdout).text();
        await proc.exited;

        expect(proc.exitCode).toBe(0);
        expect(stdout).not.toContain("Update available");
    });

    test("does not show update notification when SCFZ_NO_UPDATE_CHECK is set", async () => {
        await writeUpdateCache(temporaryCacheDirectory, "999.999.999");

        const proc = spawn(["dist/scfz", "--version"], {
            env: {
                ...process.env,
                SCFZ_UPDATE_CACHE_DIR: temporaryCacheDirectory,
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
