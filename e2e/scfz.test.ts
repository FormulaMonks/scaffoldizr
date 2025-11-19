import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, type Subprocess, spawn } from "bun";
import stripAnsi from "strip-ansi";

const keypress = {
    DOWN: "\x1B\x5B\x42",
    UP: "\x1B\x5B\x41",
    ENTER: "\x0D",
    SPACE: "\x20",
};

const INPUT_TIMEOUT = Number.parseInt(process.env.INPUT_TIMEOUT || "400", 10);

const loop = (
    process: Subprocess<"pipe", "pipe", "inherit">,
    inputs: string[],
) => {
    if (!inputs.length) {
        process.stdin.flush();
        process.stdin.end();

        // TODO: Handle I/O Error

        return;
    }

    const [input, ...rest] = inputs;
    if (typeof input === "string") {
        setTimeout(() => {
            process.stdin.write(input);
            loop(process, rest);
        }, INPUT_TIMEOUT);
    }
};

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    test("@smoke: should return the correct version", async () => {
        const proc = spawn(["dist/scfz", "--version"]);
        const text = await new Response(proc.stdout).text();

        expect(process.env.TESTED_VERSION).toBeDefined();
        expect(text.trim()).toEqual(process.env.TESTED_VERSION as string);
    });

    test("@smoke: should create a new workspace", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            "Test Workspace",
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
            expect.arrayContaining(["test-archetype.dsl"]),
        );

        const elementContents = await file(
            `${folder}/architecture/archetypes/test-archetype.dsl`,
        ).text();
        expect(elementContents).toContain("testArchetype = container {");
        expect(elementContents).toContain('technology "Java"');
        expect(elementContents).toContain('tags "Tag"');
    });

    test("should add a new system", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            "Test System 2",
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

        const contents = await readdir(`${folder}/architecture/systems`);
        expect(contents).toEqual(expect.arrayContaining(["test-system-2.dsl"]));

        const elementContents = await file(
            `${folder}/architecture/systems/test-system-2.dsl`,
        ).text();
        expect(elementContents).toContain(
            'TestSystem2 = softwareSystem "Test System 2"',
        );
    });

    test("@smoke: should add a new person", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
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

    test("should add a new external system", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
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
            keypress.DOWN,
            keypress.ENTER,
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
            `${folder}/architecture/relationships/_people.dsl`,
        ).text();

        expect(elementContents).toMatch(
            /TestPerson -> .+ "Interacts with" "Web\/HTTP"/,
        );
    });

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });
});
