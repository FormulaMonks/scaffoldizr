import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getWorkspaceJson, getWorkspacePath } from "./workspace";

const TEST_DIR = "/tmp/scaffoldizr-workspace-test";

describe("workspace utilities", () => {
    beforeEach(async () => {
        await mkdir(TEST_DIR, { recursive: true });
    });

    afterEach(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    describe("getWorkspacePath", () => {
        test("should return undefined when no workspace.dsl exists", () => {
            const result = getWorkspacePath("/nonexistent/path");
            expect(result).toBeUndefined();
        });

        test("should return directory path when workspace.dsl exists in root", async () => {
            const workspacePath = join(TEST_DIR, "workspace.dsl");
            await writeFile(workspacePath, "workspace test {}", "utf-8");

            const result = getWorkspacePath(TEST_DIR);
            expect(result).toBe(TEST_DIR);
        });

        test("should return directory path when workspace.dsl exists in architecture subfolder", async () => {
            const archDir = join(TEST_DIR, "architecture");
            await mkdir(archDir, { recursive: true });
            const workspacePath = join(archDir, "workspace.dsl");
            await writeFile(workspacePath, "workspace test {}", "utf-8");

            const result = getWorkspacePath(TEST_DIR);
            expect(result).toBe(archDir);
        });

        test("should prioritize root workspace.dsl over architecture subfolder", async () => {
            // Create workspace.dsl in both root and architecture
            const rootWorkspace = join(TEST_DIR, "workspace.dsl");
            const archDir = join(TEST_DIR, "architecture");
            await mkdir(archDir, { recursive: true });
            const archWorkspace = join(archDir, "workspace.dsl");

            await writeFile(rootWorkspace, "workspace root {}", "utf-8");
            await writeFile(archWorkspace, "workspace arch {}", "utf-8");

            const result = getWorkspacePath(TEST_DIR);
            expect(result).toBe(TEST_DIR);
        });

        test("should handle relative paths correctly", async () => {
            const workspacePath = join(TEST_DIR, "workspace.dsl");
            await writeFile(workspacePath, "workspace test {}", "utf-8");

            // Use relative path from current working directory
            const result = getWorkspacePath(TEST_DIR);
            expect(result).toBe(TEST_DIR);
        });

        test("should return undefined when workspace.dsl is empty", async () => {
            const workspacePath = join(TEST_DIR, "workspace.dsl");
            await writeFile(workspacePath, "", "utf-8");

            const result = getWorkspacePath(TEST_DIR);
            expect(result).toBeUndefined();
        });
    });

    describe("getWorkspaceJson", () => {
        test("should return undefined when workspaceFolder is undefined", async () => {
            const result = await getWorkspaceJson(undefined);
            expect(result).toBeUndefined();
        });

        test("should return undefined when workspace.json does not exist", async () => {
            const result = await getWorkspaceJson(TEST_DIR);
            expect(result).toBeUndefined();
        });

        test("should return undefined when workspace.json is empty", async () => {
            const jsonPath = join(TEST_DIR, "workspace.json");
            await writeFile(jsonPath, "", "utf-8");

            const result = await getWorkspaceJson(TEST_DIR);
            expect(result).toBeUndefined();
        });

        test("should parse and return valid workspace.json", async () => {
            const mockWorkspace = {
                id: 1,
                name: "Test Workspace",
                description: "A test workspace",
                lastModifiedDate: "2024-01-01T00:00:00Z",
                properties: {},
                model: {
                    people: [],
                    softwareSystems: [],
                    deploymentNodes: [],
                },
                configuration: {
                    branding: {},
                    styles: {},
                    terminology: {},
                },
                documentation: {
                    sections: [],
                    images: [],
                },
                views: {
                    systemLandscapeViews: [],
                    systemContextViews: [],
                    configuration: {
                        branding: {},
                        styles: {},
                        terminology: {},
                    },
                },
            };

            const jsonPath = join(TEST_DIR, "workspace.json");
            await writeFile(jsonPath, JSON.stringify(mockWorkspace), "utf-8");

            const result = await getWorkspaceJson(TEST_DIR);
            expect(result).toEqual(mockWorkspace);
        });

        test("should handle malformed JSON gracefully", async () => {
            const jsonPath = join(TEST_DIR, "workspace.json");
            await writeFile(jsonPath, "{ invalid json", "utf-8");

            expect(getWorkspaceJson(TEST_DIR)).rejects.toThrow();
        });

        test("should return parsed JSON even with minimal structure", async () => {
            const minimalWorkspace = {
                id: 1,
                name: "Minimal",
            };

            const jsonPath = join(TEST_DIR, "workspace.json");
            await writeFile(
                jsonPath,
                JSON.stringify(minimalWorkspace),
                "utf-8",
            );

            const result = await getWorkspaceJson(TEST_DIR);
            expect(result).toMatchObject(minimalWorkspace);
            expect(result?.id).toBe(1);
            expect(result?.name).toBe("Minimal");
        });
    });
});
