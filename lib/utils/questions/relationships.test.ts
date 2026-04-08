import { describe, expect, it, mock } from "bun:test";
import { Separator, separator } from "../prompts";
import type { StructurizrWorkspace } from "../workspace";
import {
    addRelationshipsToElement,
    defaultParser,
    resolveRelationshipForElement,
} from "./relationships";

mock.module("../prompts", () => ({
    select: mock(async (_options: unknown) => "outgoing"),
    input: mock(async (_options: unknown) => "Interacts with"),
    checkbox: mock(async (_options: unknown) => []),
    Separator,
    separator,
}));

mock.module("../workspace", () => ({
    getWorkspaceJson: mock(async () => undefined),
    getWorkspaceElementFiles: mock(async () => []),
    getWorkspacePath: mock((input: string) => input),
}));

const { select, input, checkbox } = await import("../prompts");

describe("resolveRelationshipForElement", () => {
    it("resolves relationship type and custom label via prompts", async () => {
        (select as ReturnType<typeof mock>).mockResolvedValueOnce("outgoing");
        (input as ReturnType<typeof mock>)
            .mockResolvedValueOnce("Calls")
            .mockResolvedValueOnce("REST/HTTP");

        const result = await resolveRelationshipForElement(
            "paymentService",
            "OrderSystem",
        );

        expect(result).toMatchObject({
            PaymentService_relationshipType: "outgoing",
            PaymentService_relationship: "Calls",
            PaymentService_technology: "REST/HTTP",
        });
    });

    it("skips relationship and technology when archetype is not custom", async () => {
        const archetypeRelationship = {
            name: "1_http",
            element: "relationship",
            path: "",
        };

        (select as ReturnType<typeof mock>)
            .mockResolvedValueOnce("incoming")
            .mockResolvedValueOnce(archetypeRelationship);

        const result = await resolveRelationshipForElement(
            "paymentService",
            "OrderSystem",
            { archetypeRelationships: [archetypeRelationship] },
        );

        expect(result).toMatchObject({
            PaymentService_relationshipType: "incoming",
        });
        expect(result.PaymentService_relationship).toBeFalsy();
        expect(result.PaymentService_technology).toBeFalsy();
    });
});

describe("addRelationshipsToElement", () => {
    it("returns empty object when workspaceInfo is undefined", async () => {
        const result = await addRelationshipsToElement("MySystem", undefined);
        expect(result).toEqual({});
    });

    it("returns empty object when no workspace elements exist", async () => {
        const workspaceInfo: StructurizrWorkspace = {
            model: { softwareSystems: [], people: [] },
            configuration: { scope: "Landscape" },
        } as unknown as StructurizrWorkspace;

        const result = await addRelationshipsToElement(
            "MySystem",
            workspaceInfo,
        );
        expect(result).toEqual({});
    });

    it("returns empty object when no relationships are selected", async () => {
        const workspaceInfo: StructurizrWorkspace = {
            model: {
                softwareSystems: [
                    {
                        id: "ps",
                        name: "PaymentSystem",
                        tags: "Element,Software System",
                        containers: [],
                    },
                ],
                people: [],
            },
            configuration: { scope: "Landscape" },
        } as unknown as StructurizrWorkspace;

        const result = await addRelationshipsToElement(
            "MySystem",
            workspaceInfo,
        );
        expect(result).toEqual({});
    });

    it("resolves relationships for each selected element", async () => {
        const workspaceInfo: StructurizrWorkspace = {
            model: {
                softwareSystems: [
                    {
                        id: "ps",
                        name: "PaymentSystem",
                        tags: "Element,Software System",
                        containers: [],
                    },
                ],
                people: [],
            },
            configuration: { scope: "Landscape" },
        } as unknown as StructurizrWorkspace;

        (checkbox as ReturnType<typeof mock>).mockResolvedValueOnce([
            "PaymentSystem",
        ]);
        (select as ReturnType<typeof mock>).mockResolvedValueOnce("outgoing");
        (input as ReturnType<typeof mock>)
            .mockResolvedValueOnce("Depends on")
            .mockResolvedValueOnce("Web/HTTP");

        const result = await addRelationshipsToElement(
            "MySystem",
            workspaceInfo,
        );

        expect(result.PaymentSystem).toMatchObject({
            relationship: "Depends on",
            relationshipType: "outgoing",
            technology: "Web/HTTP",
        });
    });
});

describe("defaultParser", () => {
    it("groups relationship map entries by element name", () => {
        const rawMap = {
            PaymentSystem_relationship: "Calls",
            PaymentSystem_relationshipType: "outgoing",
            PaymentSystem_technology: "REST",
        };

        const result = defaultParser(rawMap);

        expect(result.PaymentSystem).toEqual({
            relationship: "Calls",
            relationshipType: "outgoing",
            technology: "REST",
        });
    });
});
