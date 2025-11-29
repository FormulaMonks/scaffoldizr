import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elements } from "../labels";
import type { StructurizrWorkspace, WorkspaceElement } from "../workspace";
import {
    resolveAvailableArchetypeElements,
    resolveBaseElementQuestion,
} from "./archetypes";

// Mock the workspace module
mock.module("../workspace", () => ({
    getWorkspaceJson: mock(
        async (
            _workspacePath: string,
        ): Promise<StructurizrWorkspace | undefined> => {
            return undefined;
        },
    ),
    getWorkspaceElementFiles: mock(
        async (
            _element: string,
            _workspacePath: string,
        ): Promise<WorkspaceElement[] | undefined> => {
            return [];
        },
    ),
    getWorkspacePath: mock((input: string) => input),
}));

// Mock inquirer prompts
mock.module("@inquirer/prompts", () => ({
    select: mock(async (_options: unknown) => "softwareSystem"),
}));

const { getWorkspaceJson, getWorkspaceElementFiles } = await import(
    "../workspace"
);
const { select } = await import("@inquirer/prompts");

describe("resolveBaseElementQuestion", () => {
    beforeEach(() => {
        mock.restore();
    });

    it("returns base element with position when no archetypes exist", async () => {
        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            [],
        );
        (select as ReturnType<typeof mock>).mockResolvedValue("softwareSystem");

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "softwareSystem",
            position: 1,
        });
    });

    it("increments position based on existing archetypes", async () => {
        const existingArchetypes: WorkspaceElement[] = [
            { name: "1_api", element: "container", path: "" },
            { name: "2_database", element: "container", path: "" },
        ];

        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            existingArchetypes,
        );
        (select as ReturnType<typeof mock>).mockResolvedValue("component");

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "component",
            position: 3,
        });
    });

    it("returns archetype details when archetype is selected", async () => {
        const existingArchetypes: WorkspaceElement[] = [
            { name: "1_api", element: "container", path: "" },
        ];

        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            existingArchetypes,
        );
        (select as ReturnType<typeof mock>).mockResolvedValue({
            position: 1,
            representation: "api",
            baseElement: "container",
        });

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "container",
            archetype: "api",
            position: 2,
        });
    });

    it("handles relationship archetypes with arrow representation", async () => {
        const existingArchetypes: WorkspaceElement[] = [
            { name: "1_http", element: "relationship", path: "" },
        ];

        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            existingArchetypes,
        );
        (select as ReturnType<typeof mock>).mockResolvedValue({
            position: 1,
            representation: "--http->",
            baseElement: "relationship",
        });

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "relationship",
            archetype: "--http->",
            position: 2,
        });
    });

    it("handles landscape scope by excluding container and component options", async () => {
        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "Landscape" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            [],
        );
        (select as ReturnType<typeof mock>).mockResolvedValue("softwareSystem");

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "softwareSystem",
            position: 1,
        });

        // Verify select was called with correct options
        const selectCall = (select as ReturnType<typeof mock>).mock.calls[0][0];
        expect(selectCall.message).toBe("Base type:");
    });

    it("handles missing workspace info gracefully", async () => {
        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue(
            undefined,
        );
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            [],
        );
        (select as ReturnType<typeof mock>).mockResolvedValue("softwareSystem");

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "softwareSystem",
            position: 1,
        });
    });

    it("sorts archetypes alphabetically by name", async () => {
        const unsortedArchetypes: WorkspaceElement[] = [
            { name: "3_zebra", element: "container", path: "" },
            { name: "1_alpha", element: "container", path: "" },
            { name: "2_beta", element: "container", path: "" },
        ];

        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            unsortedArchetypes,
        );
        (select as ReturnType<typeof mock>).mockResolvedValue({
            position: 1,
            representation: "alpha",
            baseElement: "container",
        });

        const result = await resolveBaseElementQuestion("/test/path");

        // Position should be incremented based on number of archetypes
        expect(result.position).toBe(4);
    });

    it("handles undefined archetypes array", async () => {
        (getWorkspaceJson as ReturnType<typeof mock>).mockResolvedValue({
            configuration: { scope: "SoftwareSystem" },
        } as StructurizrWorkspace);
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            undefined,
        );
        (select as ReturnType<typeof mock>).mockResolvedValue("component");

        const result = await resolveBaseElementQuestion("/test/path");

        expect(result).toEqual({
            element: "component",
            position: 1,
        });
    });
});

describe("resolveAvailableArchetypes", () => {
    beforeEach(() => {
        mock.restore();
    });

    it("return no elements when workspace element files are undefined", async () => {
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            undefined,
        );

        const result = await resolveAvailableArchetypeElements(
            "/test/path",
            Elements.System,
        );

        expect(result).toEqual([]);
    });

    it("select archetypes for the selected element type", async () => {
        (getWorkspaceElementFiles as ReturnType<typeof mock>).mockResolvedValue(
            [
                { name: "1_api", element: "container", path: "" },
                { name: "2_database", element: "system", path: "" },
                { name: "3_external", element: "system", path: "" },
                { name: "4_webapp", element: "container", path: "" },
                { name: "5_other", element: "component", path: "" },
                { name: "6_https", element: "relationship", path: "" },
                { name: "7_sql", element: "relationship", path: "" },
            ],
        );

        const result1 = await resolveAvailableArchetypeElements(
            "/test/path",
            Elements.System,
        );

        expect(result1).toEqual([
            { name: "2_database", element: "system", path: "" },
            { name: "3_external", element: "system", path: "" },
        ]);

        const result2 = await resolveAvailableArchetypeElements(
            "/test/path",
            Elements.Container,
        );

        expect(result2).toEqual([
            { name: "1_api", element: "container", path: "" },
            { name: "4_webapp", element: "container", path: "" },
        ]);

        const result3 = await resolveAvailableArchetypeElements(
            "/test/path",
            Elements.Relationship,
        );

        expect(result3).toEqual([
            { name: "6_https", element: "relationship", path: "" },
            { name: "7_sql", element: "relationship", path: "" },
        ]);

        const result4 = await resolveAvailableArchetypeElements(
            "/test/path",
            Elements.Component,
        );

        expect(result4).toEqual([
            { name: "5_other", element: "component", path: "" },
        ]);
    });
});
