import { afterEach, describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { write } from "bun";
import { getWorkspaceThemes } from "./dsl";

const testArtifactsRootFolderPath = join("/tmp", "scaffoldizr-dsl-test");
const createdWorkspaceDslFilePaths: string[] = [];

const createWorkspaceDslFileWithContent = async (
    workspaceDslContent: string,
): Promise<string> => {
    const temporaryWorkspaceDslFilePath = join(
        testArtifactsRootFolderPath,
        `${randomUUID()}.dsl`,
    );
    await write(temporaryWorkspaceDslFilePath, workspaceDslContent);
    createdWorkspaceDslFilePaths.push(temporaryWorkspaceDslFilePath);
    return temporaryWorkspaceDslFilePath;
};

afterEach(async () => {
    await Promise.all(
        createdWorkspaceDslFilePaths
            .splice(0)
            .map((workspaceDslFilePath) =>
                rm(workspaceDslFilePath, { force: true }),
            ),
    );
    await rm(testArtifactsRootFolderPath, { recursive: true, force: true });
});

describe("getWorkspaceThemes", () => {
    test("returns all theme URLs when themes line exists", async () => {
        const workspaceDslFilePath = await createWorkspaceDslFileWithContent(
            `workspace "Test" {\n    views {\n        themes "https://example.com/theme-1.json" "https://example.com/theme-2.json" "https://example.com/theme-3.json"\n    }\n}`,
        );

        const workspaceThemes = await getWorkspaceThemes(workspaceDslFilePath);

        expect(workspaceThemes).toEqual([
            "https://example.com/theme-1.json",
            "https://example.com/theme-2.json",
            "https://example.com/theme-3.json",
        ]);
    });

    test("returns empty array when themes line is missing", async () => {
        const workspaceDslFilePath = await createWorkspaceDslFileWithContent(
            `workspace "Test" {\n    views {\n        !include views\n    }\n}`,
        );

        const workspaceThemes = await getWorkspaceThemes(workspaceDslFilePath);

        expect(workspaceThemes).toEqual([]);
    });

    test("throws clear error when file does not exist", async () => {
        const missingWorkspaceDslFilePath = join(
            testArtifactsRootFolderPath,
            "missing-workspace.dsl",
        );

        await expect(
            getWorkspaceThemes(missingWorkspaceDslFilePath),
        ).rejects.toThrow(
            `Workspace DSL file not found: ${missingWorkspaceDslFilePath}`,
        );
    });
});
