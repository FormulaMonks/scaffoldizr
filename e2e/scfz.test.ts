import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { $, type Subprocess, file, spawn } from "bun";
import stripAnsi from "strip-ansi";
import pkg from "../package.json";

const keypress = {
    DOWN: "\x1B\x5B\x42",
    UP: "\x1B\x5B\x41",
    ENTER: "\x0D",
    SPACE: "\x20",
};

const INPUT_TIMEOUT = 100;

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

describe("e2e", () => {
    const folder = `/tmp/test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`;

    test("@smoke: should return the correct version", async () => {
        const proc = spawn(["dist/scfz", "--version"]);
        const text = await new Response(proc.stdout).text();

        expect(text.trim()).toEqual(pkg.version);
    });

    test("@smoke: should create a new workspace", async () => {
        const proc = spawn(["dist/scfz", "--dest", folder], { stdin: "pipe" });

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

    test.todo("should add a new constant");
    test.todo("should add a new system");
    test.todo("@smoke: should add a new person");
    test.todo("should add a new external system");
    test.todo("should add a new container");
    test.todo("@smoke: should add a new view");
    test.todo("@smoke: should add a new relationship");

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });
});
