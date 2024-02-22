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
});
