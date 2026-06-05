import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawn } from "bun";
import stripAnsi from "strip-ansi";
import { keypress, loop } from "../test/io";
import { createWorkspaceFromCLI } from "../test/workspace";

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
        const response = await createWorkspaceFromCLI(folder, "softwaresystem");

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

        const scriptsContents = await readdir(`${folder}/architecture/scripts`);
        expect(scriptsContents).toEqual(
            expect.arrayContaining([
                "run.sh",
                "update.sh",
                "run.ps1",
                "update.ps1",
            ]),
        );
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

    test("@smoke: should add a new person", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.DOWN,
            keypress.DOWN,
            keypress.ENTER,
            "Test Person",
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

        const contents = await readdir(
            `${folder}/architecture/components/test-system/`,
        );
        expect(contents).toEqual(
            expect.arrayContaining(["test-container.dsl"]),
        );

        const elementContents = await file(
            `${folder}/architecture/components/test-system/test-container.dsl`,
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
            keypress.DOWN,
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

    test("should add a dynamic container-scoped view interactively", async () => {
        const addContainerProc = spawn([
            "dist/scfz",
            "container",
            "--dest",
            folder,
            "--export",
            "--elementName",
            "Db",
            "--containerDescription",
            "Database",
            "--containerType",
            "None of the above",
            "--containerTechnology",
            "PostgreSQL",
            "--relationshipNames",
            "",
        ]);

        await addContainerProc.exited;
        expect(addContainerProc.exitCode).toBe(0);

        const addEngineProc = spawn([
            "dist/scfz",
            "component",
            "--dest",
            folder,
            "--export",
            "--container",
            "Test System/Db",
            "--elementName",
            "Engine",
            "--componentDescription",
            "Engine component",
            "--componentTechnology",
            "PostgreSQL",
            "--relationshipNames",
            "",
        ]);

        await addEngineProc.exited;
        expect(addEngineProc.exitCode).toBe(0);

        const addCacheProc = spawn([
            "dist/scfz",
            "component",
            "--dest",
            folder,
            "--export",
            "--container",
            "Test System/Db",
            "--elementName",
            "Cache",
            "--componentDescription",
            "Cache component",
            "--componentTechnology",
            "Redis",
            "--relationshipNames",
            "",
        ]);

        await addCacheProc.exited;
        expect(addCacheProc.exitCode).toBe(0);

        const addRelationshipProc = spawn(
            [
                "dist/scfz",
                "relationship",
                "--dest",
                folder,
                "--export",
                "--element",
                "Component/Test System/Db/Cache",
                "--relationshipNames",
                "Db_Engine",
            ],
            {
                stdin: "pipe",
            },
        );

        loop(addRelationshipProc, [keypress.ENTER]);

        await addRelationshipProc.exited;
        expect(addRelationshipProc.exitCode).toBe(0);

        const proc = spawn(["dist/scfz", "view", "--dest", folder], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.ENTER,
            keypress.DOWN,
            keypress.ENTER,
            keypress.DOWN,
            keypress.ENTER,
            "Dynamic Container View",
            keypress.ENTER,
            "Container scoped test",
            keypress.ENTER,
            keypress.DOWN,
            keypress.ENTER,
            keypress.ENTER,
            "test",
            keypress.ENTER,
            keypress.ENTER,
            keypress.ENTER,
            "n",
            keypress.ENTER,
        ]);

        const response = await new Response(proc.stdout).text();
        console.log(`Scaffoldizr Output:\n${response}`);

        expect(proc.exitCode).toBe(0);

        const viewContents = await file(
            `${folder}/architecture/views/dynamic-container-view.dsl`,
        ).text();

        expect(viewContents).toContain('dynamic Db "DynamicContainerView"');
        expect(viewContents).toContain('Db_Cache -> Db_Engine "test"');
    });

    test("@smoke: should add a new relationship", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
            stdin: "pipe",
        });

        loop(proc, [
            keypress.UP,
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
            /.+ -> TestExternalSystem "Interacts with" "Web\/HTTP"/,
        );
    });
});
