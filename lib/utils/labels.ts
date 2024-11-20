export enum Labels {
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

export const labelElementByTags = (tags = ""): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return Labels.Person;
        if (tag === "External") return Labels.External;
        if (tag === "Container") return Labels.Container;
        if (tag === "Component") return Labels.Component;
        if (tag === "Deployment Node") return Labels.DeploymentNode;
    }

    return Labels.System;
};

export const elementTypeByTags = (tags = ""): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return "Person";
        if (tag === "External") return "External";
        if (tag === "Container") return "Container";
        if (tag === "Component") return "Component";
        if (tag === "Deployment Node") return "DeploymentNode";
    }

    return "System";
};

export const labelElementByName = (name: string): string => {
    for (const [key, label] of Object.entries(Labels)) {
        if (name.includes(key)) return label;
    }

    return Labels.System;
};
