import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { $, file, write } from "bun";
import templates from "../../templates/bundle";
import { ActionTypes } from ".";
import { addMany } from "./add-many";

describe("actions", () => {
    describe("addMany", () => {
        test("should add multiple files", async () => {
            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    templates,
                    templateFiles: "templates/scripts/**/*.sh",
                    rootPath: import.meta.dirname,
                    destination: ".test-generated",
                },
                {},
            );

            expect(result).toBeTrue();
            const generatedFile1 = file(
                resolve(import.meta.dirname, ".test-generated/scripts/run.sh"),
            );
            expect(generatedFile1.size).toBeGreaterThan(0);
            const generatedFile2 = file(
                resolve(
                    import.meta.dirname,
                    ".test-generated/scripts/update.sh",
                ),
            );
            expect(generatedFile2.size).toBeGreaterThan(0);
        });
        test("should not add if exists", async () => {
            await $`rm -rf ${resolve(
                import.meta.dirname,
                ".test-generated/scripts/update.sh",
            )}`;

            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    templates,
                    templateFiles: "templates/scripts/**/*.sh",
                    rootPath: import.meta.dirname,
                    skipIfExists: true,
                    destination: ".test-generated",
                },
                {},
            );

            expect(result).toBeTrue();
            const generatedFile1 = file(
                resolve(import.meta.dirname, ".test-generated/scripts/run.sh"),
            );
            expect(generatedFile1.size).toBeGreaterThan(0);
            const generatedFile2 = file(
                resolve(
                    import.meta.dirname,
                    ".test-generated/scripts/update.sh",
                ),
            );
            expect(generatedFile2.size).toBeGreaterThan(0);
        });
        test("shared templates", async () => {
            await $`rm -rf ${resolve(
                import.meta.dirname,
                ".test-generated/scripts/update.sh",
            )}`;

            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    templates,
                    templateFiles: "templates/**/.gitkeep",
                    rootPath: import.meta.dirname,
                    skipIfExists: true,
                    destination: ".test-generated",
                },
                {},
            );

            expect(result).toBeTrue();
            const gitkeepPath1 = resolve(
                import.meta.dirname,
                ".test-generated/decisions/.gitkeep",
            );
            expect(await file(gitkeepPath1).exists()).toBe(false);
            const gitkeepPath2 = resolve(
                import.meta.dirname,
                ".test-generated/docs/.gitkeep",
            );
            expect(await file(gitkeepPath2).exists()).toBe(false);
        });

        test("should remove .gitkeep when files are added to directory", async () => {
            const testDir = resolve(
                import.meta.dirname,
                ".test-generated/scripts-gitkeep-test",
            );
            const scriptsDir = resolve(testDir, "scripts");
            const gitkeepPath = resolve(scriptsDir, ".gitkeep");

            // Create directory and .gitkeep file
            await write(gitkeepPath, "");

            // Verify it exists
            expect(await file(gitkeepPath).exists()).toBe(true);

            // Add files to the directory
            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    templates,
                    templateFiles: "templates/scripts/**/*.sh",
                    rootPath: import.meta.dirname,
                    destination: ".test-generated/scripts-gitkeep-test",
                },
                {},
            );

            expect(result).toBeTrue();

            // Assert .gitkeep is removed
            expect(await file(gitkeepPath).exists()).toBe(false);

            // Assert .sh files were created
            const generatedFile = file(resolve(scriptsDir, "update.sh"));
            expect(generatedFile.size).toBeGreaterThan(0);
        });

        test("should skip if when() is declared", async () => {
            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    when: () => false,
                    templates,
                    templateFiles: "templates/containers/**/*.hbs",
                    rootPath: import.meta.dirname,
                    destination: ".test-generated",
                },
                {},
            );

            expect(result).toBeFalse();
        });
        test("should skip if skip() is declared", async () => {
            const result = await addMany(
                {
                    type: ActionTypes.AddMany,
                    skip: async () => "This should be skipped.",
                    templates,
                    templateFiles: "templates/containers/**/*.hbs",
                    rootPath: import.meta.dirname,
                    destination: ".test-generated",
                },
                {},
            );

            expect(result).toBeFalse();
        });
    });
});
