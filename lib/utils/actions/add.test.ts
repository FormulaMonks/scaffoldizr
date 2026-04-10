import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { file, write } from "bun";
import templates from "../../templates/bundle";
import { ActionTypes } from ".";
import { add } from "./add";

describe("actions", () => {
    describe("add", () => {
        test("should add single file", async () => {
            const result = await add(
                {
                    type: ActionTypes.Add,
                    templates,
                    templateFile: "templates/test-template.hbs",
                    rootPath: import.meta.dirname,
                    path: ".test-generated/{{kebabCase filename}}.txt",
                },
                { filename: "testFile" },
            );

            expect(result).toBeTrue();

            const generatedFile = file(
                resolve(import.meta.dirname, ".test-generated/test-file.txt"),
            );
            expect(generatedFile.size).toBeGreaterThan(0);
        });
        test("should not add if exists", async () => {
            const result = await add(
                {
                    type: ActionTypes.Add,
                    templates,
                    templateFile: "templates/test-template.hbs",
                    rootPath: import.meta.dirname,
                    skipIfExists: true,
                    path: ".test-generated/{{kebabCase filename}}.txt",
                },
                { filename: "testFile" },
            );

            expect(result).toBeFalse();

            const generatedFile = file(
                resolve(import.meta.dirname, ".test-generated/test-file.txt"),
            );
            expect(generatedFile.size).toBeGreaterThan(0);
        });

        test("should skip if when() is declared", async () => {
            const result = await add(
                {
                    type: ActionTypes.Add,
                    when: async ({ doCreate }) => !doCreate,
                    templates,
                    templateFile: "templates/test-template.hbs",
                    rootPath: import.meta.dirname,
                    skipIfExists: true,
                    path: ".test-generated/{{kebabCase filename}}.txt",
                },
                { filename: "testFile2", doCreate: true },
            );

            expect(result).toBeFalse();

            const generatedFile = file(
                resolve(import.meta.dirname, ".test-generated/test-file-2.txt"),
            );
            expect(generatedFile.size).toEqual(0);
        });

        test("should skip if skip() is declared", async () => {
            const result = await add(
                {
                    type: ActionTypes.Add,
                    skip: ({ doNotCreate }) =>
                        doNotCreate && "This should be skipped",
                    templates,
                    templateFile: "templates/test-template.hbs",
                    rootPath: import.meta.dirname,
                    skipIfExists: true,
                    path: ".test-generated/{{kebabCase filename}}.txt",
                },
                { filename: "testFile3", doNotCreate: true },
            );

            expect(result).toBeFalse();

            const generatedFile = file(
                resolve(import.meta.dirname, ".test-generated/test-file-3.txt"),
            );
            expect(generatedFile.size).toEqual(0);
        });

        test("should remove .gitkeep from grandparent directory", async () => {
            const rootPath = import.meta.dirname;
            const gitkeepPath = resolve(rootPath, ".test-generated/.gitkeep");

            // Create .gitkeep file in root directory
            await write(gitkeepPath, "");

            // Verify it exists
            expect(await file(gitkeepPath).exists()).toBe(true);

            // Add a file in a subdirectory
            const result = await add(
                {
                    type: ActionTypes.Add,
                    templates,
                    templateFile: "templates/test-template.hbs",
                    rootPath,
                    path: ".test-generated/subdir/test-file-5.txt",
                },
                { filename: "testFile5" },
            );

            expect(result).toBeTrue();

            // Assert .gitkeep in root is removed
            expect(await file(gitkeepPath).exists()).toBe(false);
        });
    });
});
