import { afterAll, describe, expect, test } from "bun:test";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawn } from "bun";
import { createWorkspaceFromCLI } from "../test/workspace";

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e: non-interactive workspace (landscape)", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should create a landscape workspace non-interactively", async () => {
        const proc = spawn([
            "dist/scfz",
            "--dest",
            folder,
            "--workspaceName",
            "NI Landscape",
            "--workspaceDescription",
            "NI Landscape Description",
            "--workspaceScope",
            "landscape",
            "--authorName",
            "Test Author",
            "--authorEmail",
            "test@example.com",
            "--shouldIncludeTheme",
            "false",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const architectureFolder = await readdir(folder);
        expect(architectureFolder).toContain("architecture");

        const contents = await readdir(`${folder}/architecture`);
        expect(contents).toContain("decisions");

        const workspaceContents = await file(
            `${folder}/architecture/workspace.dsl`,
        ).text();
        expect(workspaceContents).toContain("NI Landscape");
    });
});

describe("e2e: non-interactive workspace (softwaresystem)", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should create a softwaresystem workspace non-interactively", async () => {
        const proc = spawn([
            "dist/scfz",
            "--dest",
            folder,
            "--workspaceName",
            "NI SoftwareSystem",
            "--workspaceDescription",
            "NI SoftwareSystem Description",
            "--workspaceScope",
            "softwaresystem",
            "--systemName",
            "NI System",
            "--systemDescription",
            "NI System Description",
            "--authorName",
            "Test Author",
            "--authorEmail",
            "test@example.com",
            "--shouldIncludeTheme",
            "false",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const workspaceContents = await file(
            `${folder}/architecture/workspace.dsl`,
        ).text();
        expect(workspaceContents).toContain("NI SoftwareSystem");
    });
});

describe("e2e: non-interactive subcommands (landscape)", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should add a system non-interactively", async () => {
        await createWorkspaceFromCLI(folder, "landscape");

        const proc = spawn([
            "dist/scfz",
            "system",
            "--dest",
            folder,
            "--systemName",
            "NI System",
            "--systemDescription",
            "A non-interactive system",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const systemFileExists = await file(
            `${folder}/architecture/systems/ni-system.dsl`,
        ).exists();
        expect(systemFileExists).toBe(true);

        const elementContents = await file(
            `${folder}/architecture/systems/ni-system.dsl`,
        ).text();
        expect(elementContents).toContain(
            'NiSystem = softwareSystem "NI System"',
        );
    });
});

describe("e2e: non-interactive subcommands (softwaresystem)", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should add a container non-interactively", async () => {
        await createWorkspaceFromCLI(folder, "softwaresystem");

        const proc = spawn([
            "dist/scfz",
            "container",
            "--dest",
            folder,
            "--elementName",
            "NI Container",
            "--containerDescription",
            "A non-interactive container",
            "--containerType",
            "None of the above",
            "--containerTechnology",
            "Node.js",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const containerFileExists = await file(
            `${folder}/architecture/containers/test-system/ni-container.dsl`,
        ).exists();
        expect(containerFileExists).toBe(true);

        const elementContents = await file(
            `${folder}/architecture/containers/test-system/ni-container.dsl`,
        ).text();
        expect(elementContents).toContain(
            'NiContainer = container "NI Container"',
        );
    });
});

describe("e2e: non-interactive validation failures", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("should reject container subcommand in landscape scope", async () => {
        await createWorkspaceFromCLI(folder, "landscape");

        const proc = spawn([
            "dist/scfz",
            "container",
            "--dest",
            folder,
            "--elementName",
            "Fail Container",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(1);
    });

    test("should reject duplicate element name", async () => {
        const subfolder = join(
            TMP_FOLDER,
            `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
        );

        try {
            await createWorkspaceFromCLI(subfolder, "softwaresystem");

            const firstProc = spawn([
                "dist/scfz",
                "container",
                "--dest",
                subfolder,
                "--export",
                "--elementName",
                "Duplicate Container",
                "--containerDescription",
                "First container",
                "--containerType",
                "None of the above",
                "--containerTechnology",
                "Node.js",
            ]);

            await firstProc.exited;
            expect(firstProc.exitCode).toBe(0);

            const secondProc = spawn([
                "dist/scfz",
                "container",
                "--dest",
                subfolder,
                "--elementName",
                "Duplicate Container",
                "--containerDescription",
                "Second container",
                "--containerType",
                "None of the above",
                "--containerTechnology",
                "Node.js",
            ]);

            await secondProc.exited;
            expect(secondProc.exitCode).toBe(1);
        } finally {
            await $`rm -rf ${subfolder}`;
        }
    });
});
