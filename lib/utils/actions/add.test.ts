import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { file } from "bun";
import { ActionTypes } from ".";
import templates from "../../templates/bundle";
import { add } from "./add";

describe("actions > add", () => {
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
});
