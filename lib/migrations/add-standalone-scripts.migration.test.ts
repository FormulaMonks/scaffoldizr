import { afterEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { file, write } from "bun";
import { structurizrVersion } from "../utils/structurizr-version";
import { addStandaloneScriptsMigration } from "./add-standalone-scripts.migration";

const createTempDir = () =>
    join(tmpdir(), `scaffoldizr-standalone-scripts-test-${randomUUID()}`);

const existingScriptFiles = [
    "scripts/run.sh",
    "scripts/run.ps1",
    "scripts/update.sh",
    "scripts/update.ps1",
];

const newScriptFiles = [
    "scripts/export.sh",
    "scripts/export.ps1",
    "scripts/inspect.sh",
    "scripts/inspect.ps1",
];

const allScriptFiles = [...existingScriptFiles, ...newScriptFiles];

const dummyContent = "# dummy placeholder content";

const createTempDirWithExistingScripts = async (): Promise<string> => {
    const testDir = createTempDir();
    await mkdir(testDir, { recursive: true });
    await mkdir(resolve(testDir, "scripts"), { recursive: true });
    for (const relativePath of existingScriptFiles) {
        await write(resolve(testDir, relativePath), dummyContent);
    }
    return testDir;
};

describe("addStandaloneScriptsMigration.apply", () => {
    let testDir: string;

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    test("dryRun=true: returns applied=true with 8 filesChanged and does not write files", async () => {
        testDir = await createTempDirWithExistingScripts();

        const result = await addStandaloneScriptsMigration.apply(
            testDir,
            testDir,
            true,
        );

        expect(result.applied).toBe(true);
        expect(result.filesChanged).toHaveLength(8);

        for (const relativePath of existingScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).toBe(dummyContent);
        }

        for (const relativePath of newScriptFiles) {
            const exists =
                (await file(resolve(testDir, relativePath)).size) > 0;
            expect(exists).toBe(false);
        }
    });

    test("dryRun=false: writes all 8 scripts with rendered template content", async () => {
        testDir = await createTempDirWithExistingScripts();

        const result = await addStandaloneScriptsMigration.apply(
            testDir,
            testDir,
            false,
        );

        expect(result.applied).toBe(true);
        expect(result.filesChanged).toHaveLength(8);

        for (const relativePath of allScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content.length).toBeGreaterThan(0);
            expect(content).not.toBe(dummyContent);
            expect(content).not.toContain("{{structurizrVersion}}");
            expect(content).toContain(structurizrVersion);
        }
    });

    test("is idempotent: applying twice produces identical file contents", async () => {
        testDir = await createTempDirWithExistingScripts();

        await addStandaloneScriptsMigration.apply(testDir, testDir, false);

        const contentsAfterFirstRun = await Promise.all(
            allScriptFiles.map((relativePath) =>
                file(resolve(testDir, relativePath)).text(),
            ),
        );

        await addStandaloneScriptsMigration.apply(testDir, testDir, false);

        const contentsAfterSecondRun = await Promise.all(
            allScriptFiles.map((relativePath) =>
                file(resolve(testDir, relativePath)).text(),
            ),
        );

        expect(contentsAfterSecondRun).toEqual(contentsAfterFirstRun);
    });
});
