import { dirname, join, resolve } from "node:path";
import { file } from "bun";

type Item = Record<string, unknown>;
type Properties = {
    "structurizr.dsl"?: string;
    "structurizr.dsl.identifier"?: string;
};
type Documentation = {
    sections: {
        content: string;
        format: string;
        filename: string;
        order: number;
        title: string;
    }[];
    images: {
        name: string;
        content: string;
        type: string;
    }[];
};

type Element = {
    id: string;
    x: number;
    y: number;
};

type SoftwareElement = {
    id: string;
    tags: string;
    properties: Properties;
    name: string;
    description: string;
    location: string;
    documentation: Documentation;
    relationships: Relationship[];
};

type SoftwareSystem = SoftwareElement & {
    containers: Item[];
};

type DeploymentNode = SoftwareElement & {
    environment: string;
    instances: string;
    softwareSystemInstances: [
        {
            id: "112";
            tags: "Software System Instance";
            properties: {
                "structurizr.dsl.identifier": "slackinstance";
            };
            relationships: [
                {
                    id: "117";
                    sourceId: "112";
                    destinationId: "116";
                    description: "Receive incoming webhook commands";
                    technology: "JSON/HTTP API";
                    linkedRelationshipId: "110";
                },
            ];
            environment: "Live";
            deploymentGroups: ["Default"];
            instanceId: 1;
            softwareSystemId: "1";
        },
    ];
};

type Relationship = {
    id: string;
    description: string;
    order: string;
    tags: string;
    properties: Properties;
    response: boolean;
    vertices: {
        x: number;
        y: number;
    }[];
    sourceId: string;
    destinationId: string;
    technology: string;
    linkedRelationshipId: string;
};

type View = {
    key: string;
    order: number;
    description: string;
    dimensions: {
        width: number;
        height: number;
    };
    softwareSystemId: string;
    automaticLayout: {
        implementation: string;
        rankDirection: string;
        rankSeparation: number;
        nodeSeparation: number;
        edgeSeparation: number;
        vertices: boolean;
    };
    relationships: Relationship[];
    enterpriseBoundaryVisible: boolean;
    elements: Element[];
};

type Configuration = {
    branding: Item;
    styles: Item;
    terminology: Item;
};

export type StructurizrWorkspace = {
    id: number;
    name: string;
    description: string;
    lastModifiedDate: string;
    properties: Properties;
    model: {
        people: SoftwareElement[];
        softwareSystems: SoftwareSystem[];
        deploymentNodes: DeploymentNode[];
    };
    documentation: Documentation;
    systemContextViews: View[];
    configuration: Configuration;
};

export const getWorkspacePath = (input: string): string | undefined => {
    let workspaceFullPath = resolve(`${input}/workspace.dsl`);
    let workspaceFile = file(workspaceFullPath);

    if (workspaceFile.size > 0) return dirname(workspaceFullPath);

    // Try again with the "architecture" inner path
    workspaceFullPath = resolve(`${input}/architecture/workspace.dsl`);
    workspaceFile = file(workspaceFullPath);

    if (workspaceFile.size > 0) return dirname(workspaceFullPath);

    return undefined;
};

export const getWorkspaceJson = async (
    workspaceFolder: string | undefined,
): Promise<StructurizrWorkspace | undefined> => {
    if (!workspaceFolder) return undefined;
    const workspaceFile = file(join(workspaceFolder, "/workspace.json"));

    if (workspaceFile.size > 0) {
        const workspaceJson = await workspaceFile.json();
        return workspaceJson;
    }

    return undefined;
};
