import { describe, expect, spyOn, test } from "bun:test";
import { resolve } from "node:path";
import { file, write } from "bun";
import templates from "../../templates/bundle";
import { ActionTypes } from ".";
import { replace } from "./replace";

describe("actions", () => {
    describe("replace", () => {
        test("should replace matched line", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/replace/replace-test.txt",
            );

            await write(testFilePath, initialContent);

            const result = await replace(
                {
                    type: ActionTypes.Replace,
                    rootPath: import.meta.dirname,
                    templates,
                    path: testFilePath,
                    pattern: /content 2/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test" },
            );

            expect(result).toBeTrue();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(
                "Content 1\ntemplate append-test\ncontent 3",
            );
        });

        test("should warn when no match found and not modify file", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/replace/replace-test-2.txt",
            );

            await write(testFilePath, initialContent);
            const consoleLogSpy = spyOn(console, "log").mockImplementation(
                () => {},
            );

            const result = await replace(
                {
                    type: ActionTypes.Replace,
                    rootPath: import.meta.dirname,
                    templates,
                    path: testFilePath,
                    pattern: /content 4/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test" },
            );

            expect(result).toBeFalse();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(initialContent);
            expect(consoleLogSpy).toHaveBeenCalled();

            consoleLogSpy.mockRestore();
        });

        test("should skip if when() is declared", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/replace/replace-test-3.txt",
            );

            await write(testFilePath, initialContent);

            const result = await replace(
                {
                    type: ActionTypes.Replace,
                    when: async ({ doCreate }) => !doCreate,
                    rootPath: import.meta.dirname,
                    templates,
                    path: testFilePath,
                    pattern: /content 2/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test", doCreate: true },
            );

            expect(result).toBeFalse();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(initialContent);
        });

        test("should skip if skip() is declared", async () => {
            const initialContent = "Content 1\ncontent 2\ncontent 3";
            const testFilePath = resolve(
                import.meta.dirname,
                ".test-generated/replace/replace-test-4.txt",
            );

            await write(testFilePath, initialContent);

            const result = await replace(
                {
                    type: ActionTypes.Replace,
                    skip: ({ doNotCreate }) => doNotCreate,
                    rootPath: import.meta.dirname,
                    templates,
                    path: testFilePath,
                    pattern: /content 2/,
                    templateFile: "templates/test-template.hbs",
                },
                { filename: "Append test", doNotCreate: true },
            );

            expect(result).toBeFalse();
            const fileContents = await file(testFilePath).text();
            expect(fileContents).toEqual(initialContent);
        });
    });
});
