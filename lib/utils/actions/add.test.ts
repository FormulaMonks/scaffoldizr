import { afterAll, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { $, file } from "bun";
import { ActionTypes } from ".";
import testTemplate from "../../templates/test-template.hbs";
import { add } from "./add";

describe("actions > add", () => {
    test("should add single file", async () => {
        const result = await add(
            { filename: "testFile" },
            {
                type: ActionTypes.Add,
                templateFile: testTemplate,
                path: `${
                    import.meta.dirname
                }/.test-generated/{{kebabCase filename}}.txt`,
            },
        );

        expect(result).toBeTrue();

        const generatedFile = file(
            resolve(import.meta.dirname, ".test-generated/test-file.txt"),
        );
        expect(generatedFile.size).toBeGreaterThan(0);
    });
    test("should not add if exists", async () => {
        const result = await add(
            { filename: "testFile" },
            {
                type: ActionTypes.Add,
                templateFile: testTemplate,
                skipIfExists: true,
                path: `${
                    import.meta.dirname
                }/.test-generated/{{kebabCase filename}}.txt`,
            },
        );

        expect(result).toBeFalse();

        const generatedFile = file(
            resolve(import.meta.dirname, ".test-generated/test-file.txt"),
        );
        expect(generatedFile.size).toBeGreaterThan(0);
    });
    afterAll(async () => {
        await $`rm ${resolve(
            import.meta.dirname,
            ".test-generated/test-file.txt",
        )}`;
    });
});
