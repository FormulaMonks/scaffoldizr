import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import * as operatingSystem from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkUpdate } from "./update";

const UPDATE_CACHE_FILE = ".scaffoldizr-update.json";
const UPDATE_CHECK_WINDOW = 86_400_000;

let temporaryHomeDirectory = "";
let originalHomeEnvironmentVariable: string | undefined;
let originalNoUpdateCheckEnvironmentVariable: string | undefined;
let originalStdoutIsTTY: boolean | undefined;
let originalFetch: typeof globalThis.fetch;
let homedirSpy: ReturnType<typeof spyOn>;

function setStdoutTTY(isTTY: boolean) {
    Object.defineProperty(process.stdout, "isTTY", {
        value: isTTY,
        configurable: true,
    });
}

async function writeUpdateCacheFile(
    latestVersion: string,
    checkedAt: number = Date.now(),
) {
    const updateCachePath = join(temporaryHomeDirectory, UPDATE_CACHE_FILE);
    await writeFile(
        updateCachePath,
        JSON.stringify({ latestVersion, checkedAt }),
        "utf8",
    );
}

describe("checkUpdate", () => {
    beforeEach(async () => {
        temporaryHomeDirectory = await mkdtemp(
            join(tmpdir(), "scaffoldizr-update-test-"),
        );
        originalHomeEnvironmentVariable = process.env.HOME;
        originalNoUpdateCheckEnvironmentVariable =
            process.env.SCFZ_NO_UPDATE_CHECK;
        originalStdoutIsTTY = process.stdout.isTTY;
        originalFetch = globalThis.fetch;
        homedirSpy = spyOn(operatingSystem, "homedir").mockReturnValue(
            temporaryHomeDirectory,
        );

        process.env.HOME = temporaryHomeDirectory;
        delete process.env.SCFZ_NO_UPDATE_CHECK;
        setStdoutTTY(true);
        globalThis.fetch = ((..._args: Parameters<typeof globalThis.fetch>) =>
            Promise.resolve(
                new Response(null, { status: 500 }),
            )) as unknown as typeof globalThis.fetch;
    });

    afterEach(async () => {
        if (originalHomeEnvironmentVariable === undefined) {
            delete process.env.HOME;
        } else {
            process.env.HOME = originalHomeEnvironmentVariable;
        }

        if (originalNoUpdateCheckEnvironmentVariable === undefined) {
            delete process.env.SCFZ_NO_UPDATE_CHECK;
        } else {
            process.env.SCFZ_NO_UPDATE_CHECK =
                originalNoUpdateCheckEnvironmentVariable;
        }

        setStdoutTTY(Boolean(originalStdoutIsTTY));
        globalThis.fetch = originalFetch;
        homedirSpy.mockRestore();
        await rm(temporaryHomeDirectory, { recursive: true, force: true });
    });

    describe("version comparison via fresh cache", () => {
        it("returns notification when 0.10.0 is newer than 0.9.3", async () => {
            await writeUpdateCacheFile("0.10.0");

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeString();
            expect(updateMessage).toContain(
                "curl -s https://formulamonks.github.io/",
            );
        });

        it("returns null when 0.9.3 equals 0.9.3", async () => {
            await writeUpdateCacheFile("0.9.3");

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });

        it("returns notification when 1.0.0 is newer than 0.9.3", async () => {
            await writeUpdateCacheFile("1.0.0");

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeString();
            expect(updateMessage).toContain(
                "curl -s https://formulamonks.github.io/",
            );
        });

        it("returns null when 0.9.3 is not newer than 1.0.0", async () => {
            await writeUpdateCacheFile("0.9.3");

            const updateMessage = await checkUpdate("1.0.0");

            expect(updateMessage).toBeNull();
        });
    });

    describe("bailout guards", () => {
        it("returns null when stdout is not a TTY", async () => {
            setStdoutTTY(false);

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });

        it("returns null when SCFZ_NO_UPDATE_CHECK is set", async () => {
            process.env.SCFZ_NO_UPDATE_CHECK = "1";

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });

        it("returns null when SCFZ_NO_UPDATE_CHECK is set to empty string", async () => {
            process.env.SCFZ_NO_UPDATE_CHECK = "";

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });
    });

    describe("cache handling", () => {
        it("returns notification string for fresh cache with newer version", async () => {
            await writeUpdateCacheFile("2.0.0");

            const updateMessage = await checkUpdate("1.9.9");

            expect(updateMessage).toBeString();
            expect(updateMessage).toContain(
                "curl -s https://formulamonks.github.io/",
            );
        });

        it("returns null for fresh cache with same or older version", async () => {
            await writeUpdateCacheFile("1.0.0");
            const sameVersionUpdateMessage = await checkUpdate("1.0.0");
            expect(sameVersionUpdateMessage).toBeNull();

            await writeUpdateCacheFile("0.9.9");
            const olderVersionUpdateMessage = await checkUpdate("1.0.0");
            expect(olderVersionUpdateMessage).toBeNull();
        });

        it("returns null for stale cache", async () => {
            await writeUpdateCacheFile(
                "2.0.0",
                Date.now() - UPDATE_CHECK_WINDOW - 3_600_000,
            );

            const updateMessage = await checkUpdate("1.0.0");

            expect(updateMessage).toBeNull();
        });

        it("returns null for missing cache", async () => {
            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });

        it("returns null for malformed cache", async () => {
            const updateCachePath = join(
                temporaryHomeDirectory,
                UPDATE_CACHE_FILE,
            );
            await writeFile(updateCachePath, "{ malformed", "utf8");

            const updateMessage = await checkUpdate("0.9.3");

            expect(updateMessage).toBeNull();
        });
    });
});
