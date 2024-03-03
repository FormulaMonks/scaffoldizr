export enum Labels {
    Constant = "🔸",
    Container = "🔹",
    External = "⬜️",
    Person = "👤",
    System = "🟦",
    Relationship = "⇢ ",
    View = "🔳",
}

export const labelElementByTags = (tags: string): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return Labels.Person;
        if (tag === "External") return Labels.External;
        if (tag === "Container") return Labels.Container;
    }

    return Labels.System;
};

export const elementTypeByTags = (tags: string): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return "Person";
        if (tag === "External") return "External";
        if (tag === "Container") return "Container";
    }

    return "System";
};

export const labelElementByName = (name: string): string => {
    for (const [key, label] of Object.entries(Labels)) {
        if (name.includes(key)) return label;
    }

    return Labels.System;
};
