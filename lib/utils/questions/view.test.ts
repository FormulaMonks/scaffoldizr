import { describe, expect, test } from "bun:test";
import { Separator } from "../prompts";
import {
    normalizeWorkspaceScope,
    type StructurizrWorkspace,
} from "../workspace";
import type { StepElementChoice, ViewElement } from "./view";
import {
    getDynamicStepElementChoices,
    getRelationshipsForElement,
} from "./view";

describe("getRelationshipsForElement", () => {
    test("returns elements with outgoing relationship from source", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
            relationships: [
                { sourceId: "source-1", destinationId: "target-1" },
            ],
        };
        const candidates: ViewElement[] = [
            { id: "target-1", name: "Target One" },
            { id: "target-2", name: "Target Two" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("target-1");
    });

    test("does not return elements that only have an incoming relationship to source", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
        };
        const candidates: ViewElement[] = [
            {
                id: "caller-1",
                name: "Caller",
                relationships: [
                    { sourceId: "caller-1", destinationId: "source-1" },
                ],
            },
            { id: "unrelated-1", name: "Unrelated" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        expect(result).toHaveLength(0);
    });

    test("returns both outgoing and incoming partners as union", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
            relationships: [
                { sourceId: "source-1", destinationId: "outgoing-1" },
            ],
        };
        const candidates: ViewElement[] = [
            { id: "outgoing-1", name: "Outgoing Target" },
            {
                id: "incoming-1",
                name: "Incoming Caller",
                relationships: [
                    { sourceId: "incoming-1", destinationId: "source-1" },
                ],
            },
            { id: "unrelated-1", name: "Unrelated" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        expect(result).toHaveLength(1);
        const resultIds = result.map((e) => e.id);
        expect(resultIds).toContain("outgoing-1");
        expect(resultIds).not.toContain("incoming-1");
    });

    test("excludes elements with no relationship to source", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
            relationships: [
                { sourceId: "source-1", destinationId: "target-1" },
            ],
        };
        const candidates: ViewElement[] = [
            { id: "target-1", name: "Target" },
            { id: "unrelated-1", name: "Unrelated One" },
            { id: "unrelated-2", name: "Unrelated Two" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        const resultIds = result.map((e) => e.id);
        expect(resultIds).not.toContain("unrelated-1");
        expect(resultIds).not.toContain("unrelated-2");
    });

    test("returns empty array when source has no relationships and no candidates point to source", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
        };
        const candidates: ViewElement[] = [
            { id: "candidate-1", name: "Candidate One" },
            { id: "candidate-2", name: "Candidate Two" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        expect(result).toHaveLength(0);
    });

    test("does not include source element itself in results", () => {
        const source: ViewElement = {
            id: "source-1",
            name: "Source",
            relationships: [
                { sourceId: "source-1", destinationId: "target-1" },
            ],
        };
        const candidates: ViewElement[] = [
            source,
            { id: "target-1", name: "Target" },
        ];

        const result = getRelationshipsForElement(source, candidates);

        const resultIds = result.map((e) => e.id);
        expect(resultIds).not.toContain("source-1");
        expect(resultIds).toContain("target-1");
    });
});

function makeWorkspace(
    overrides: Partial<StructurizrWorkspace["model"]> = {},
): StructurizrWorkspace {
    return {
        id: 1,
        name: "Test",
        description: "",
        lastModifiedDate: "",
        properties: {},
        configuration: {
            scope: "SoftwareSystem",
            styles: {},
            branding: {},
            terminology: {},
        },
        documentation: { sections: [], images: [] },
        views: {
            systemLandscapeViews: [],
            systemContextViews: [],
            configuration: {} as never,
        },
        model: {
            people: [],
            softwareSystems: [],
            deploymentNodes: [],
            ...overrides,
        },
    };
}

const defaultWorkspace = makeWorkspace({
    people: [
        {
            id: "p1",
            name: "User",
            tags: "Element,Person",
            description: "",
            documentation: { sections: [], images: [] },
            properties: {},
            relationships: [],
        },
    ],
    softwareSystems: [
        {
            id: "ss1",
            name: "My System",
            tags: "Element,Software System",
            description: "",
            location: "Internal",
            documentation: { sections: [], images: [] },
            properties: {},
            relationships: [],
            containers: [
                {
                    id: "c1",
                    name: "My Container",
                    tags: "Element,Container",
                    technology: "Node",
                    description: "",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    components: [
                        {
                            id: "comp1",
                            name: "My Component",
                            tags: "Element,Component",
                            technology: "TS",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                        },
                    ],
                },
            ],
        },
        {
            id: "ss2",
            name: "External",
            tags: "Element,Software System,External",
            description: "",
            location: "External",
            documentation: { sections: [], images: [] },
            properties: {},
            relationships: [],
            containers: [],
        },
    ],
    deploymentNodes: [],
});

function isStepElementChoice(
    value: StepElementChoice | Separator,
): value is StepElementChoice {
    return !(value instanceof Separator);
}

describe("getDynamicStepElementChoices", () => {
    test("workspace scope returns all elements", () => {
        const result = getDynamicStepElementChoices(
            defaultWorkspace,
            "workspace",
        );
        const nonSeparatorResults = result.filter(isStepElementChoice);

        expect(nonSeparatorResults.length).toBe(5);
    });

    test("workspace scope includes separators", () => {
        const result = getDynamicStepElementChoices(
            defaultWorkspace,
            "workspace",
        );

        expect(result.some((value) => value instanceof Separator)).toBe(true);
    });

    test("system scope includes person regardless of systemName", () => {
        const result = getDynamicStepElementChoices(
            defaultWorkspace,
            "system",
            "SomeSystem",
        );

        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "p1",
            ),
        ).toBe(true);
    });

    test("system scope includes separators", () => {
        const result = getDynamicStepElementChoices(
            defaultWorkspace,
            "system",
            "SomeSystem",
        );

        expect(result.some((value) => value instanceof Separator)).toBe(true);
    });

    test("system scope includes external system regardless of systemName", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ext1",
                    name: "External",
                    tags: "Element,Software System,External",
                    description: "",
                    location: "External",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "SomeSystem",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "ext1",
            ),
        ).toBe(true);
    });

    test("system scope excludes scoped system by name", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
                {
                    id: "ss2",
                    name: "Other System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "My System",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "ss1",
            ),
        ).toBe(false);
    });

    test("system scope excludes scoped system from results", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "MySystem",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
                {
                    id: "ss2",
                    name: "OtherSystem",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "MySystem",
        );

        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.name === "MySystem",
            ),
        ).toBe(false);
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.name === "OtherSystem",
            ),
        ).toBe(true);
    });

    test("system scope includes non-matching system", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
                {
                    id: "ss2",
                    name: "Other System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "My System",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "ss2",
            ),
        ).toBe(true);
    });

    test("system scope returns containers whose systemName matches", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c1",
                            name: "API",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [],
                        },
                    ],
                },
                {
                    id: "ss2",
                    name: "Other System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c2",
                            name: "DB",
                            tags: "Element,Container",
                            technology: "Postgres",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [],
                        },
                    ],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "My System",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "c1",
            ),
        ).toBe(true);
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "c2",
            ),
        ).toBe(false);
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "comp1",
            ),
        ).toBe(false);
    });

    test("system scope excludes components even when they belong to the matched system", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c1",
                            name: "My Container",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [
                                {
                                    id: "comp1",
                                    name: "Match Component",
                                    tags: "Element,Component",
                                    technology: "TS",
                                    description: "",
                                    documentation: { sections: [], images: [] },
                                    properties: {},
                                    relationships: [],
                                },
                            ],
                        },
                    ],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "system",
            "My System",
        );

        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "comp1",
            ),
        ).toBe(false);
    });

    test("container scope includes person regardless of scope constraints", () => {
        const workspace = defaultWorkspace;

        const result = getDynamicStepElementChoices(
            workspace,
            "container",
            "SomeSystem",
            "SomeContainer",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "p1",
            ),
        ).toBe(true);
    });

    test("container scope includes separators when components exist", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c1",
                            name: "My Container",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [
                                {
                                    id: "comp1",
                                    name: "Match Component",
                                    tags: "Element,Component",
                                    technology: "TS",
                                    description: "",
                                    documentation: { sections: [], images: [] },
                                    properties: {},
                                    relationships: [],
                                },
                            ],
                        },
                    ],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "container",
            "My System",
            "My Container",
        );

        expect(result.some((value) => value instanceof Separator)).toBe(true);
    });

    test("container scope returns component where systemName and containerName both match", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c1",
                            name: "My Container",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [
                                {
                                    id: "comp1",
                                    name: "Match Component",
                                    tags: "Element,Component",
                                    technology: "TS",
                                    description: "",
                                    documentation: { sections: [], images: [] },
                                    properties: {},
                                    relationships: [],
                                },
                            ],
                        },
                        {
                            id: "c2",
                            name: "Other Container",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [
                                {
                                    id: "comp2",
                                    name: "Other Component",
                                    tags: "Element,Component",
                                    technology: "TS",
                                    description: "",
                                    documentation: { sections: [], images: [] },
                                    properties: {},
                                    relationships: [],
                                },
                            ],
                        },
                    ],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "container",
            "My System",
            "My Container",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "comp1",
            ),
        ).toBe(true);
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "comp2",
            ),
        ).toBe(false);
    });

    test("container scope excludes containers (only returns components)", () => {
        const workspace = makeWorkspace({
            people: [],
            softwareSystems: [
                {
                    id: "ss1",
                    name: "My System",
                    tags: "Element,Software System",
                    description: "",
                    location: "Internal",
                    documentation: { sections: [], images: [] },
                    properties: {},
                    relationships: [],
                    containers: [
                        {
                            id: "c1",
                            name: "My Container",
                            tags: "Element,Container",
                            technology: "Node",
                            description: "",
                            documentation: { sections: [], images: [] },
                            properties: {},
                            relationships: [],
                            components: [
                                {
                                    id: "comp1",
                                    name: "A Component",
                                    tags: "Element,Component",
                                    technology: "TS",
                                    description: "",
                                    documentation: { sections: [], images: [] },
                                    properties: {},
                                    relationships: [],
                                },
                            ],
                        },
                    ],
                },
            ],
            deploymentNodes: [],
        });

        const result = getDynamicStepElementChoices(
            workspace,
            "container",
            "My System",
            "My Container",
        );
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "c1",
            ),
        ).toBe(false);
        expect(
            result.some(
                (e): e is StepElementChoice =>
                    isStepElementChoice(e) && e._element.id === "comp1",
            ),
        ).toBe(true);
    });
});

describe("normalizeWorkspaceScope", () => {
    test("returns undefined for undefined", () => {
        expect(normalizeWorkspaceScope(undefined)).toBeUndefined();
    });

    test("returns undefined for empty string", () => {
        expect(normalizeWorkspaceScope("")).toBeUndefined();
    });

    test("normalizes lowercase softwaresystem", () => {
        expect(normalizeWorkspaceScope("softwaresystem")).toBe(
            "SoftwareSystem",
        );
    });

    test("normalizes mixed case SoftwareSystem", () => {
        expect(normalizeWorkspaceScope("SoftwareSystem")).toBe(
            "SoftwareSystem",
        );
    });

    test("normalizes spaced software system", () => {
        expect(normalizeWorkspaceScope("software system")).toBe(
            "SoftwareSystem",
        );
    });

    test("normalizes lowercase landscape", () => {
        expect(normalizeWorkspaceScope("landscape")).toBe("Landscape");
    });

    test("normalizes mixed case Landscape", () => {
        expect(normalizeWorkspaceScope("Landscape")).toBe("Landscape");
    });

    test("returns undefined for unknown values", () => {
        expect(normalizeWorkspaceScope("unknown")).toBeUndefined();
    });
});
