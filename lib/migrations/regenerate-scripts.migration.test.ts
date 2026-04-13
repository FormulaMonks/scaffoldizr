import { afterEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { file, write } from "bun";
import { regenerateScriptsMigration } from "./regenerate-scripts.migration";

const createTempDir = () =>
    join(tmpdir(), `scaffoldizr-regen-scripts-test-${randomUUID()}`);

const scriptFiles = [
    "scripts/run.sh",
    "scripts/run.ps1",
    "scripts/update.sh",
    "scripts/update.ps1",
];

const dummyContent = "# dummy placeholder content";

const createTempDirWithScripts = async (): Promise<string> => {
    const testDir = createTempDir();
    await mkdir(testDir, { recursive: true });
    await mkdir(resolve(testDir, "scripts"), { recursive: true });
    for (const relativePath of scriptFiles) {
        await write(resolve(testDir, relativePath), dummyContent);
    }
    return testDir;
};

describe("regenerateScriptsMigration.apply", () => {
    let testDir: string;

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    test("dryRun=true: returns applied=true with 4 filesChanged and does not modify files", async () => {
        testDir = await createTempDirWithScripts();

        const result = await regenerateScriptsMigration.apply(
            testDir,
            testDir,
            true,
        );

        expect(result.applied).toBe(true);
        expect(result.filesChanged).toHaveLength(4);

        for (const relativePath of scriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).toBe(dummyContent);
        }
    });

    test("dryRun=false: returns applied=true and overwrites script files with real template content", async () => {
        testDir = await createTempDirWithScripts();

        const result = await regenerateScriptsMigration.apply(
            testDir,
            testDir,
            false,
        );

        expect(result.applied).toBe(true);

        for (const relativePath of scriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content.length).toBeGreaterThan(0);
            expect(content).not.toBe(dummyContent);
        }
    });
});
