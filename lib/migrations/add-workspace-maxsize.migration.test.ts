import { afterEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { file, write } from "bun";
import { structurizrVersion } from "../utils/structurizr-version";
import { addWorkspaceMaxSizeMigration } from "./add-workspace-maxsize.migration";

const createTempDir = () =>
    join(tmpdir(), `scaffoldizr-workspace-maxsize-test-${randomUUID()}`);

// Only the server ("local") reads structurizr.workspace.maxsize, which
// STRUCTURIZR_WORKSPACE_MAXSIZE sets, so the override belongs in run.* and
// nowhere else.
const serverScriptFiles = ["scripts/run.sh", "scripts/run.ps1"];

const otherScriptFiles = [
    "scripts/update.sh",
    "scripts/update.ps1",
    "scripts/export.sh",
    "scripts/export.ps1",
    "scripts/inspect.sh",
    "scripts/inspect.ps1",
];

const allScriptFiles = [...serverScriptFiles, ...otherScriptFiles];

const dummyContent = "# dummy placeholder content";

const createTempDirWithExistingScripts = async (): Promise<string> => {
    const testDir = createTempDir();
    await mkdir(resolve(testDir, "scripts"), { recursive: true });
    for (const relativePath of allScriptFiles) {
        await write(resolve(testDir, relativePath), dummyContent);
    }
    return testDir;
};

describe("addWorkspaceMaxSizeMigration.apply", () => {
    let testDir: string;

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    test("dryRun=true: returns applied=true with 8 filesChanged and does not write files", async () => {
        testDir = await createTempDirWithExistingScripts();

        const result = await addWorkspaceMaxSizeMigration.apply(
            testDir,
            testDir,
            true,
        );

        expect(result.applied).toBe(true);
        expect(result.filesChanged).toHaveLength(8);

        for (const relativePath of allScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).toBe(dummyContent);
        }
    });

    test("dryRun=false: regenerates all 8 scripts with the locked Structurizr version", async () => {
        testDir = await createTempDirWithExistingScripts();

        const result = await addWorkspaceMaxSizeMigration.apply(
            testDir,
            testDir,
            false,
        );

        expect(result.applied).toBe(true);
        expect(result.filesChanged).toHaveLength(8);

        for (const relativePath of allScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).not.toBe(dummyContent);
            expect(content).not.toContain("{{structurizrVersion}}");
            expect(content).toContain(structurizrVersion);
        }
    });

    test("adds the workspace max size override to the server scripts only", async () => {
        testDir = await createTempDirWithExistingScripts();

        await addWorkspaceMaxSizeMigration.apply(testDir, testDir, false);

        for (const relativePath of serverScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).toContain("STRUCTURIZR_WORKSPACE_MAXSIZE");
            expect(content).toContain("STCTZR_MAX_WORKSPACE_SIZE");
            expect(content).toContain("10MB");
        }

        for (const relativePath of otherScriptFiles) {
            const content = await file(resolve(testDir, relativePath)).text();
            expect(content).not.toContain("STRUCTURIZR_WORKSPACE_MAXSIZE");
            expect(content).not.toContain("STCTZR_MAX_WORKSPACE_SIZE");
        }
    });

    test("is idempotent: applying twice produces identical file contents", async () => {
        testDir = await createTempDirWithExistingScripts();

        await addWorkspaceMaxSizeMigration.apply(testDir, testDir, false);

        const contentsAfterFirstRun = await Promise.all(
            allScriptFiles.map((relativePath) =>
                file(resolve(testDir, relativePath)).text(),
            ),
        );

        await addWorkspaceMaxSizeMigration.apply(testDir, testDir, false);

        const contentsAfterSecondRun = await Promise.all(
            allScriptFiles.map((relativePath) =>
                file(resolve(testDir, relativePath)).text(),
            ),
        );

        expect(contentsAfterSecondRun).toEqual(contentsAfterFirstRun);
    });
});
