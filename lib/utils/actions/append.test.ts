import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { file, write } from "bun";
import { ActionTypes } from ".";
import templates from "../../templates/bundle";
import { append } from "./append";

describe("actions", () => {
    describe("append", () => {
        test("should append to existing file", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/append/append-test.txt",
            );

            await write(testFilePath, initialContent);

            const result = await append(
                {
                    type: ActionTypes.Append,
                    rootPath: import.meta.dirname,
                    templates: templates,
                    path: testFilePath,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test" },
            );

            expect(result).toBeTrue();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(
                `${initialContent}\ntemplate append-test`,
            );
        });

        test("should append after pattern match", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/append/append-test-2.txt",
            );

            await write(testFilePath, initialContent);

            const result = await append(
                {
                    type: ActionTypes.Append,
                    rootPath: import.meta.dirname,
                    templates: templates,
                    path: testFilePath,
                    pattern: /content 2/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test" },
            );

            expect(result).toBeTrue();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(
                "Content 1\ncontent 2\ntemplate append-test\ncontent 3",
            );
        });
        test("should skip when pattern not found", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/append/append-test-3.txt",
            );

            await write(testFilePath, initialContent);

            const result = await append(
                {
                    type: ActionTypes.Append,
                    rootPath: import.meta.dirname,
                    templates: templates,
                    path: testFilePath,
                    pattern: /content 4/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test" },
            );

            expect(result).toBeFalse();
        });
        test("should error when file not found", async () => {
            expect(
                async () =>
                    await append(
                        {
                            type: ActionTypes.Append,
                            rootPath: import.meta.dirname,
                            templates: templates,
                            path: ".test-generated/not-found.txt",
                            templateFile: "templates/test-template.hbs",
                        },
                        { filename: "Append test" },
                    ),
            ).toThrow(/File not found/);
        });
        test("should skip if when() is declared", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/append/append-test-3.txt",
            );

            await write(testFilePath, initialContent);

            const result = await append(
                {
                    type: ActionTypes.Append,
                    when: async ({ doCreate }) => !doCreate,
                    rootPath: import.meta.dirname,
                    templates: templates,
                    path: testFilePath,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test", doCreate: true },
            );

            expect(result).toBeFalse();
        });
        test("should skip if skip() is declared", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/append/append-test-3.txt",
            );

            await write(testFilePath, initialContent);

            const result = await append(
                {
                    type: ActionTypes.Append,
                    skip: ({ doNotCreate }) => doNotCreate,
                    rootPath: import.meta.dirname,
                    templates: templates,
                    path: testFilePath,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test", doNotCreate: true },
            );

            expect(result).toBeFalse();
        });
    });
});
