import { afterAll, beforeAll, describe, expect, test } from "bun:test";
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

describe("e2e: non-interactive archetype subcommand", () => {
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

    test("should add a relationship archetype non-interactively without optional fields", async () => {
        const proc = spawn([
            "dist/scfz",
            "archetype",
            "--dest",
            folder,
            "--archetypeName",
            "HTTPS",
            "--archetypeBaseType",
            "relationship",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const archetypeFileExists = await file(
            `${folder}/architecture/archetypes/1_https_relationship.dsl`,
        ).exists();
        expect(archetypeFileExists).toBe(true);

        const elementContents = await file(
            `${folder}/architecture/archetypes/1_https_relationship.dsl`,
        ).text();
        expect(elementContents).toContain("https = -> {");
        expect(elementContents).not.toContain("description");
        expect(elementContents).not.toContain("technology");
    });

    test("should add a relationship archetype non-interactively with optional description", async () => {
        const proc = spawn([
            "dist/scfz",
            "archetype",
            "--dest",
            folder,
            "--archetypeName",
            "GRPC",
            "--archetypeBaseType",
            "relationship",
            "--archetypeDescription",
            "gRPC protocol",
            "--archetypeTechnology",
            "gRPC",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const elementContents = await file(
            `${folder}/architecture/archetypes/2_grpc_relationship.dsl`,
        ).text();
        expect(elementContents).toContain('description "gRPC protocol"');
        expect(elementContents).toContain('technology "gRPC"');
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

describe("e2e: non-interactive dynamic view", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    beforeAll(async () => {
        await createWorkspaceFromCLI(folder, "softwaresystem", {
            id: 1,
            name: "Test",
            description: "",
            lastModifiedDate: "",
            properties: {},
            model: {
                people: [],
                softwareSystems: [
                    {
                        id: "1",
                        tags: "Element,Software System",
                        properties: {},
                        name: "App",
                        description: "",
                        documentation: { sections: [], images: [] },
                        relationships: [],
                        location: "Internal",
                        containers: [
                            {
                                id: "2",
                                tags: "Element,Container",
                                properties: {},
                                name: "Web",
                                description: "",
                                documentation: { sections: [], images: [] },
                                relationships: [],
                                technology: "",
                            },
                            {
                                id: "3",
                                tags: "Element,Container",
                                properties: {},
                                name: "Db",
                                description: "",
                                documentation: { sections: [], images: [] },
                                relationships: [],
                                technology: "",
                                components: [
                                    {
                                        id: "4",
                                        tags: "Element,Component",
                                        properties: {},
                                        name: "Cache",
                                        description: "",
                                        documentation: {
                                            sections: [],
                                            images: [],
                                        },
                                        relationships: [],
                                        technology: "",
                                    },
                                    {
                                        id: "5",
                                        tags: "Element,Component",
                                        properties: {},
                                        name: "Engine",
                                        description: "",
                                        documentation: {
                                            sections: [],
                                            images: [],
                                        },
                                        relationships: [],
                                        technology: "",
                                    },
                                ],
                            },
                        ],
                    },
                ],
                deploymentNodes: [],
            },
            configuration: {
                branding: {},
                styles: {},
                terminology: {},
                scope: "Software System",
            },
            documentation: { sections: [], images: [] },
            views: {
                systemLandscapeViews: [],
                systemContextViews: [],
                configuration: {
                    branding: {},
                    styles: {},
                    terminology: {},
                },
            },
        });
    });

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("should allow dynamic container scope via CLI args", async () => {
        const proc = spawn([
            "dist/scfz",
            "view",
            "--dest",
            folder,
            "--viewType",
            "dynamic",
            "--dynamicScope",
            "container",
            "--systemName",
            "App",
            "--containerName",
            "Db",
            "--viewName",
            "DynTest",
            "--viewDescription",
            "Test",
            "--step-1",
            'Cache -> Engine "test"',
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const viewContents = await file(
            `${folder}/architecture/views/dyn-test.dsl`,
        ).text();

        expect(viewContents).toContain('dynamic Db "DynTest"');
        expect(viewContents).toContain('Cache -> Engine "test"');
    });
});
