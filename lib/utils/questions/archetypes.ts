import { Elements } from "../labels";
import { type Separator as SeparatorType, select, separator } from "../prompts";
import {
    getWorkspaceElementFiles,
    getWorkspaceJson,
    getWorkspacePath,
    type WorkspaceElement,
} from "../workspace";

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

    const allChoices: { name: string; value: string }[] = [
        ...mappedArchetypes.map((a) => ({
            name: a.name,
            value: `archetype:${a.value.baseElement}:${a.value.representation}`,
        })),
        ...(!isLandscapeScope
            ? [
                  { name: "Container", value: "container" },
                  { name: "Component", value: "component" },
              ]
            : []),
        { name: "Software System", value: "system" },
        { name: "Relationship (->)", value: "relationship" },
    ];

    const archetypeChoices = allChoices.slice(0, mappedArchetypes.length);
    const baseChoices = allChoices.slice(mappedArchetypes.length);

    const selectionKey = await select<string>({
        name: "archetypeBaseType",
        message: "Base type:",
        choices: [
            separator("Archetypes", archetypeChoices),
            ...archetypeChoices,
            separator("Base elements", baseChoices),
            ...baseChoices,
        ].filter(
            (c): c is SeparatorType | { name: string; value: string } =>
                c !== undefined,
        ),
    });

    if (selectionKey.startsWith("archetype:")) {
        const [, baseElement, representation] = selectionKey.split(":");
        return {
            element: baseElement,
            archetype: representation,
            position: mappedArchetypes.length + 1,
        };
    }

    if (selectionKey === "system") {
        return {
            element: "system",
            archetype: "softwareSystem",
            position: mappedArchetypes.length + 1,
        };
    }

    return {
        element: selectionKey,
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
