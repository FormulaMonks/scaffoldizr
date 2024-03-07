import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { $, file } from "bun";
import { ActionTypes } from ".";
import templates from "../../templates/bundle";
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
            const generatedFile1 = file(
                resolve(
                    import.meta.dirname,
                    ".test-generated/decisions/.gitkeep",
                ),
            );
            expect(generatedFile1.size).toBeGreaterThan(0);
            const generatedFile2 = file(
                resolve(import.meta.dirname, ".test-generated/docs/.gitkeep"),
            );
            expect(generatedFile2.size).toBeGreaterThan(0);
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
