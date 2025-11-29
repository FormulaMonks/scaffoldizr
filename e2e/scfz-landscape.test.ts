import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawn } from "bun";
import stripAnsi from "strip-ansi";
import { keypress, loop } from "../test/io";
import { createWorkspaceFromCLI } from "../test/workspace";

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e: landscape", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should create a new workspace", async () => {
        const response = await createWorkspaceFromCLI(folder, "landscape");

        expect(stripAnsi(response)).toContain("Welcome to Scaffoldizr");
        expect(stripAnsi(response)).toContain("Test Workspace");
        expect(stripAnsi(response)).toContain("Landscape");

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

    test("@smoke: should add a new system", async () => {
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
            keypress.SPACE,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        const contents = await readdir(`${folder}/architecture/systems`);
        expect(contents).toEqual(expect.arrayContaining(["test-system.dsl"]));

        const elementContents = await file(
            `${folder}/architecture/systems/test-system.dsl`,
        ).text();
        expect(elementContents).toContain(
            'TestSystem = softwareSystem "Test System"',
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
});
