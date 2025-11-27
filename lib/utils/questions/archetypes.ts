import { type Separator, select } from "@inquirer/prompts";
import { Elements } from "../labels";
import {
    getWorkspaceElementFiles,
    getWorkspaceJson,
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
            const isSystem = archetype.element === "system";
            const [position, name] = archetype.name.split("_");

            return {
                name: `${name} ${
                    isRelationship ? "(->)" : `(${archetype.element})`
                }`,
                value: {
                    position: Number.parseInt(position, 10),
                    representation: isRelationship
                        ? `--${name}->`
                        : isSystem
                          ? "softwareSystem"
                          : name,
                    baseElement: archetype.element,
                },
            };
        });
};

export async function resolveBaseElementQuestion(
    workspacePath: string,
): Promise<{ element: string; archetype?: string; position: number }> {
    const workspaceInfo = await getWorkspaceJson(
        getWorkspacePath(workspacePath),
    );
    const availableArchetypes = await getWorkspaceElementFiles(
        Elements.Archetype,
        getWorkspacePath(workspacePath),
    );

    const isLandscapeScope =
        workspaceInfo?.configuration.scope?.toLowerCase() === "landscape";
    const mappedArchetypes = mapArchetypeToChoice(availableArchetypes);

    const baseTypes = [
        !isLandscapeScope
            ? { name: "Container", value: "container" }
            : undefined,
        !isLandscapeScope
            ? { name: "Component", value: "component" }
            : undefined,
        {
            name: "Software System",
            value: {
                baseElement: "system",
                representation: "softwareSystem",
            },
        },
        { name: "Relationship (->)", value: "relationship" },
    ];

    const selection = await select<string | ArchetypeChoice>({
        message: "Base type:",
        // @ts-expect-error -- We're already filtering undefined values
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
        position: mappedArchetypes.length + 1,
    };
}

export async function resolveAvailableArchetypeElements(
    workspacePath: string,
    elementType:
        | Elements.Container
        | Elements.Component
        | Elements.Relationship
        | Elements.System,
): Promise<WorkspaceElement[]> {
    const availableArchetypes = await getWorkspaceElementFiles(
        Elements.Archetype,
        getWorkspacePath(workspacePath),
    );

    const filteredArchetypes = availableArchetypes?.filter((archetype) => {
        return archetype.element === elementType.toLowerCase();
    });

    return filteredArchetypes ?? [];
}
