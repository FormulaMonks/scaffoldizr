import { type Separator, select } from "@inquirer/prompts";
import { Elements } from "../labels";
import {
    getWorkspaceElementFiles,
    getWorkspacePath,
    type WorkspaceElement,
} from "../workspace";
import { separator } from "./utils";

type ArchetypeChoice = {
    position: number;
    representation: string;
    baseElement: string;
};

const mapArchetypeToChoice = (archetypes: WorkspaceElement[] | undefined) => {
    if (!archetypes) return [];

    return archetypes
        .toSorted((a, b) => (a.name > b.name ? 1 : -1))
        .map((archetype) => {
            const isRelationship = archetype.element === "relationship";
            const [position, name] = archetype.name.split("_");

            return {
                name: `${name} ${
                    isRelationship ? "(->)" : `(${archetype.element})`
                }`,
                value: {
                    position: Number.parseInt(position, 10),
                    representation: isRelationship ? `--${name}->` : name,
                    baseElement: archetype.element,
                },
            };
        });
};

export async function resolveBaseElementQuestion(
    workspacePath: string,
): Promise<{ element: string; archetype?: string; position: number }> {
    const availableArchetypes = await getWorkspaceElementFiles(
        Elements.Archetype,
        getWorkspacePath(workspacePath),
    );

    const mappedArchetypes = mapArchetypeToChoice(availableArchetypes);

    const baseTypes = [
        { name: "Container", value: "container" },
        { name: "Component", value: "component" },
        { name: "Software System", value: "softwareSystem" },
        { name: "Relationship (->)", value: "relationship" },
    ];

    const selection = await select<string | ArchetypeChoice>({
        message: "Base type:",
        choices: [
            separator("Archetypes", mappedArchetypes),
            ...mappedArchetypes,
            separator("Base elements", baseTypes),
            ...baseTypes,
        ].filter(Boolean) as ((typeof baseTypes)[number] | Separator)[],
    });

    if (typeof selection === "string") {
        return {
            element: selection,
            position: mappedArchetypes.length + 1,
        };
    }

    return {
        element: selection.baseElement,
        archetype: selection.representation,
        position: selection.position + 1,
    };
}
