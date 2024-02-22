import { afterAll, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { $, file } from "bun";
import { ActionTypes } from ".";
import templates from "../../templates/bundle";
import { addMany } from "./add-many";

describe("actions > addMany", () => {
    test("should add multiple files", async () => {
        const result = await addMany(
            {},
            {
                type: ActionTypes.AddMany,
                templates,
                templateFiles: "templates/scripts/**/*.sh",
                rootPath: import.meta.dirname,
                destination: ".test-generated",
            },
        );

        expect(result).toBeTrue();
        const generatedFile1 = file(
            resolve(import.meta.dirname, ".test-generated/scripts/run.sh"),
        );
        expect(generatedFile1.size).toBeGreaterThan(0);
        const generatedFile2 = file(
            resolve(import.meta.dirname, ".test-generated/scripts/update.sh"),
        );
        expect(generatedFile2.size).toBeGreaterThan(0);
    });
    test("should not add if exists", async () => {
        await $`rm -rf ${resolve(
            import.meta.dirname,
            ".test-generated/scripts/update.sh",
        )}`;

        const result = await addMany(
            {},
            {
                type: ActionTypes.AddMany,
                templates,
                templateFiles: "templates/scripts/**/*.sh",
                rootPath: import.meta.dirname,
                skipIfExists: true,
                destination: ".test-generated",
            },
        );

        expect(result).toBeTrue();
        const generatedFile1 = file(
            resolve(import.meta.dirname, ".test-generated/scripts/run.sh"),
        );
        expect(generatedFile1.size).toBeGreaterThan(0);
        const generatedFile2 = file(
            resolve(import.meta.dirname, ".test-generated/scripts/update.sh"),
        );
        expect(generatedFile2.size).toBeGreaterThan(0);
    });
    afterAll(async () => {
        await $`rm -rf ${resolve(import.meta.dirname, ".test-generated")}`;
    });
});
