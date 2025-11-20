export enum Labels {
    Archetype = "🔺",
    Constant = "🟡",
    Container = "🔷",
    Component = "🔹",
    External = "⬜️",
    Person = "👤",
    System = "🟦",
    DeploymentNode = "🟧",
    Relationship = "⇢ ",
    View = "🔳",
}

export enum Elements {
    Archetype = "Archetype",
    Constant = "Constant",
    Container = "Container",
    Component = "Component",
    ExternalSystem = "External System",
    Person = "Person",
    System = "System",
    DeploymentNode = "Deployment Node",
    Relationship = "Relationship",
    View = "View",
    Workspace = "Workspace",
}

export const Folders = {
    [Elements.Archetype]: "archetypes",
    [Elements.Container]: "containers",
    [Elements.Component]: "components",
    [Elements.DeploymentNode]: "environments",
    [Elements.Relationship]: "relationships",
    [Elements.View]: "views",
};

export const SORTED_GENERATOR_AVAILABLE_ELEMENTS: string[] = [
    Elements.Workspace,
    Elements.Constant,
    Elements.Archetype,
    Elements.System,
    Elements.Person,
    Elements.ExternalSystem,
    Elements.Container,
    Elements.Component,
    Elements.View,
    Elements.Relationship,
];

export const labelElementByTags = (tags = ""): string => {
    for (const tag of tags.split(",")) {
        if (tag === Elements.Person) return Labels.Person;
        if (tag === Elements.ExternalSystem) return Labels.External;
        if (tag === Elements.Container) return Labels.Container;
        if (tag === Elements.Component) return Labels.Component;
        if (tag === Elements.DeploymentNode) return Labels.DeploymentNode;
    }

    return Labels.System;
};

export const elementTypeByTags = (tags = ""): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return Elements.Person;
        if (tag === "External") return Elements.ExternalSystem;
        if (tag === "Container") return Elements.Container;
        if (tag === "Component") return Elements.Component;
        if (tag === "Deployment Node") return Elements.DeploymentNode;
    }

    return "System";
};

export const labelElementByName = (name: string): string => {
    for (const [key, label] of Object.entries(Labels)) {
        if (name.includes(key)) return label;
    }

    return Labels.System;
};
