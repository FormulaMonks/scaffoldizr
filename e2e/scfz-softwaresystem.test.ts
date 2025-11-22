import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawn } from "bun";
import stripAnsi from "strip-ansi";
import { keypress, loop } from "../test/io";

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e: Software System", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should create a new workspace", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            "Test Workspace",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            "Test System",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        expect(stripAnsi(response)).toContain("Welcome to Scaffoldizr");
        expect(stripAnsi(response)).toContain("Test Workspace");
        expect(stripAnsi(response)).toContain("Test System");

        const architectureFolder = await readdir(folder);
        expect(architectureFolder).toContain("architecture");

        const contents = await readdir(`${folder}/architecture`);

        expect(contents).toEqual(
            expect.arrayContaining([
                "workspace.dsl",
                "environments",
                "docs",
                "decisions",
                ".gitattributes",
                ".gitignore",
                "scripts",
                "containers",
                "systems",
                "views",
                ".env-arch",
                "relationships",
            ]),
        );

        const workspaceContents = await file(
            `${folder}/architecture/workspace.dsl`,
        ).text();
        expect(workspaceContents).toContain("Test Workspace");
    });

    test("should add a new constant", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.ENTER,
            "TEST",
            keypress.ENTER,
            "Value",
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const workspaceContents = await file(
            `${folder}/architecture/workspace.dsl`,
        ).text();
        expect(workspaceContents).toContain('const TEST "Value"');
    });

    test("should add a new archetype", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.ENTER,
            "TestArchetype",
            keypress.ENTER,
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
            expect.arrayContaining(["test-archetype_container.dsl"]),
        );

        const elementContents = await file(
            `${folder}/architecture/archetypes/test-archetype_container.dsl`,
        ).text();
        expect(elementContents).toContain("testArchetype = container {");
        expect(elementContents).toContain('technology "Java"');
        expect(elementContents).toContain('tags "Tag"');
    });

    test("should add a new person", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            keypress.ENTER,
            "Test Person",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const contents = await readdir(`${folder}/architecture/systems`);
        expect(contents).toEqual(expect.arrayContaining(["_people.dsl"]));

        const elementContents = await file(
            `${folder}/architecture/systems/_people.dsl`,
        ).text();
        expect(elementContents).toContain('TestPerson = person "Test Person"');
    });

    test("@smoke: should add a new external system", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            keypress.ENTER,
            "Test External System",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
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
            'TestExternalSystem = softwareSystem "Test External System"',
        );
    });

    test("@smoke: should add a new container", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            "Test Container",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            "Node.js",
            keypress.SPACE,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const contents = await readdir(`${folder}/architecture/containers`);
        expect(contents).toEqual(expect.arrayContaining(["test-system"]));

        const elementContents = await file(
            `${folder}/architecture/containers/test-system/test-container.dsl`,
        ).text();
        expect(elementContents).toContain(
            'TestContainer = container "Test Container"',
        );
    });

    test("should add a new component", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            keypress.ENTER,
            "Test Component",
            keypress.ENTER,
            keypress.ENTER,
            "Technology",
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const contents = await readdir(`${folder}/architecture/components`);
        expect(contents).toEqual(
            expect.arrayContaining(["test-system--test-container.dsl"]),
        );

        const elementContents = await file(
            `${folder}/architecture/components/test-system--test-container.dsl`,
        ).text();
        expect(elementContents).toContain(
            'TestContainer_TestComponent = component "Test Component"',
        );
    });

    test("should add a new view", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            "Test View",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const contents = await readdir(`${folder}/architecture/views`);
        expect(contents).toEqual(expect.arrayContaining(["test-view.dsl"]));

        const elementContents = await file(
            `${folder}/architecture/views/test-view.dsl`,
        ).text();

        expect(elementContents).toContain('deployment TestSystem "Test View"');
    });

    test("@smoke: should add a new relationship", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.UP,
            keypress.ENTER,
            keypress.ENTER,
            keypress.SPACE,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const elementContents = await file(
            `${folder}/architecture/relationships/_external.dsl`,
        ).text();

        expect(elementContents).toMatch(
            /.+ -> TestExternalSystem "Interacts with" "Web\/HTTP"/,
        );
    });
});
