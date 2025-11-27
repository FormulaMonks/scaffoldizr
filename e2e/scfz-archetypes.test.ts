import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawn } from "bun";
// import stripAnsi from "strip-ansi";
import { keypress, loop } from "../test/io";
import { createWorkspaceFromCLI } from "../test/workspace";

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e: archetypes", () => {
    describe("Software System", () => {
        const folder = join(
            TMP_FOLDER,
            `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
        );

        beforeAll(async () => {
            await createWorkspaceFromCLI(folder, "softwaresystem");
        });

        afterAll(async () => {
            await $`rm -rf ${folder}`;
        });

        test("should add a new archetype (container)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.ENTER,
                "TestArchetype",
                keypress.ENTER,
                "Description",
                keypress.ENTER,
                "Java",
                keypress.ENTER,
                "Tag",
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/archetypes`);
            expect(contents).toEqual(
                expect.arrayContaining(["1_testArchetype_container.dsl"]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/1_testArchetype_container.dsl`,
            ).text();
            expect(elementContents).toContain("testArchetype = container {");
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "Java"');
            expect(elementContents).toContain('tags "Tag"');
        });

        test.todo("should add a new archetype (relationship)", async () => {});
        test.todo("should add a new archetype (Software System)", async () => {});
        test.todo("should add a new archetype (Component)", async () => {});
    });

    describe("Landscape", () => {
        const folder = join(
            TMP_FOLDER,
            `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
        );

        beforeAll(async () => {
            await createWorkspaceFromCLI(folder, "landscape");
        });

        afterAll(async () => {
            await $`rm -rf ${folder}`;
        });

        test("should add a new archetype (Software System)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.ENTER,
                "TestArchetype",
                keypress.ENTER,
                "Description",
                keypress.ENTER,
                "Tag",
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/archetypes`);
            expect(contents).toEqual(
                expect.arrayContaining(["1_testArchetype_softwareSystem.dsl"]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/1_testArchetype_softwareSystem.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetype = softwareSystem {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).not.toContain("technology");
            expect(elementContents).toContain('tags "Tag"');
        });

        test.todo("should add a new archetype (relationship)", async () => {});
    });
});
