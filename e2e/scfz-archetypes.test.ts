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

        test("should add a new archetype (Container)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.ENTER,
                "TestArchetypeContainer",
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
                expect.arrayContaining([
                    "1_testArchetypeContainer_container.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/1_testArchetypeContainer_container.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeContainer = container {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "Java"');
            expect(elementContents).toContain('tags "Tag"');
        });

        test("should add a new archetype (Component)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.UP,
                keypress.UP,
                keypress.UP,
                keypress.ENTER,
                "TestArchetypeComponent",
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
                expect.arrayContaining([
                    "2_testArchetypeComponent_component.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/2_testArchetypeComponent_component.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeComponent = component {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "Java"');
            expect(elementContents).toContain('tags "Tag"');
        });

        test("should add a new archetype (Software System)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.UP,
                keypress.UP,
                keypress.ENTER,
                "TestArchetypeSoftwareSystem",
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
                expect.arrayContaining([
                    "3_testArchetypeSoftwareSystem_system.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/3_testArchetypeSoftwareSystem_system.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeSoftwareSystem = softwareSystem {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).not.toContain("technology");
            expect(elementContents).toContain('tags "Tag"');
        });

        test("should add a new archetype (Relationship)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.UP,
                keypress.ENTER,
                "TestArchetypeRelationship",
                keypress.ENTER,
                "Description",
                keypress.ENTER,
                "HTTPS",
                keypress.ENTER,
                "Tag",
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/archetypes`);
            expect(contents).toEqual(
                expect.arrayContaining([
                    "4_testArchetypeRelationship_relationship.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/4_testArchetypeRelationship_relationship.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeRelationship = -> {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "HTTPS"');
            expect(elementContents).toContain('tags "Tag"');
        });

        test.todo("new containers should have available container archetypes", async () => {});
        test.todo("new components should have available component archetypes", async () => {});
        test.todo("new external software systems should have available software system archetypes", async () => {});
        test.todo("new relationships should have available relationship archetypes", async () => {});
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
                "TestArchetypeSS",
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
                expect.arrayContaining(["1_testArchetypeSs_system.dsl"]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/1_testArchetypeSs_system.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeSs = softwareSystem {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).not.toContain("technology");
            expect(elementContents).toContain('tags "Tag"');
        });

        test("should add a new archetype (Relationship)", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.UP,
                keypress.ENTER,
                "TestArchetypeRelationship",
                keypress.ENTER,
                "Description",
                keypress.ENTER,
                "HTTPS",
                keypress.ENTER,
                "Tag",
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/archetypes`);
            expect(contents).toEqual(
                expect.arrayContaining([
                    "2_testArchetypeRelationship_relationship.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/2_testArchetypeRelationship_relationship.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testArchetypeRelationship = -> {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "HTTPS"');
            expect(elementContents).toContain('tags "Tag"');
        });

        test("should extend from existing relationship archetype", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.ENTER,
                keypress.DOWN,
                keypress.ENTER,
                "TestExtendRelationship",
                keypress.ENTER,
                "Description",
                keypress.ENTER,
                "HTTPS",
                keypress.ENTER,
                "Tag",
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/archetypes`);
            expect(contents).toEqual(
                expect.arrayContaining([
                    "3_testExtendRelationship_relationship.dsl",
                ]),
            );

            const elementContents = await file(
                `${folder}/architecture/archetypes/3_testExtendRelationship_relationship.dsl`,
            ).text();
            expect(elementContents).toContain(
                "testExtendRelationship = --testArchetypeRelationship-> {",
            );
            expect(elementContents).toContain('description "Description"');
            expect(elementContents).toContain('technology "HTTPS"');
            expect(elementContents).toContain('tags "Tag"');
        });
        test("new software systems should have available software system archetypes", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.DOWN,
                keypress.ENTER,
                "Test System",
                keypress.ENTER,
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/systems`);
            expect(contents).toEqual(
                expect.arrayContaining(["test-system.dsl"]),
            );

            const elementContents = await file(
                `${folder}/architecture/systems/test-system.dsl`,
            ).text();
            expect(elementContents).toContain(
                'TestSystem = testArchetypeSs "Test System"',
            );
        });
        test("new external software systems should have available software system archetypes", async () => {
            const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
                stdin: "pipe",
            });

            loop(proc, [
                keypress.DOWN,
                keypress.DOWN,
                keypress.DOWN,
                keypress.DOWN,
                keypress.ENTER,
                "Test External System",
                keypress.ENTER,
                keypress.ENTER,
                keypress.ENTER,
            ]);

            const response = await new Response(proc.stdout).text();
            console.log(`Scaffoldizr Output:\n${response}`);

            const contents = await readdir(`${folder}/architecture/systems`);
            expect(contents).toEqual(expect.arrayContaining(["_external.dsl"]));
            const elementContents = await file(
                `${folder}/architecture/systems/_external.dsl`,
            ).text();
            expect(elementContents).toContain(
                'TestExternalSystem = testArchetypeSs "Test External System"',
            );
        });
        test.todo("new relationships should have available relationship archetypes", async () => {});
    });
});
