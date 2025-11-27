import { checkbox, input, Separator, select } from "@inquirer/prompts";
import { pascalCase } from "change-case";
import type { QuestionsObject } from "../generator";
import { removeSpaces } from "../handlebars";
import { Elements, labelElementByTags } from "../labels";
import type { StructurizrWorkspace, WorkspaceElement } from "../workspace";
import { resolveAvailableArchetypeElements } from "./archetypes";
import { getAllWorkspaceElements } from "./system";
import { separator } from "./utils";

export type Relationship = {
    relationship: string;
    relationshipType: string;
    technology: string;
};

type RelationshipForElementOptions = {
    defaultRelationship?: string;
    defaultRelationshipType?: string;
    defaultTechnology?: string;
    archetypeRelationships?: WorkspaceElement[];
};

type AddRelationshipOptions = {
    validate?: Parameters<typeof checkbox>[0]["validate"];
    filterChoices?: (
        elm: Separator | { name: string; value: string },
        pos: number,
        arr: unknown[],
    ) => boolean;
    parse?: typeof defaultParser;
    includeContainers?: string;
    includeComponents?: string;
    message?: string;
    workspacePath?: string;
} & RelationshipForElementOptions;

export const defaultParser = (rawRelationshipMap: Record<string, string>) => {
    return Object.entries(rawRelationshipMap).reduce(
        (result: Record<string, Relationship>, next) => {
            const [elmName, value] = next[0].split("_");
            result[elmName] = result[elmName] ?? {};
            result[elmName][value as keyof Relationship] = next[1];

            return result;
        },
        {},
    );
};

export const componentParser = (rawRelationshipMap: Record<string, string>) => {
    return Object.entries(rawRelationshipMap).reduce(
        (result: Record<string, Relationship>, next) => {
            const [containerName, elmName, value] = next[0].split("_");
            const relName = value
                ? `${containerName}_${elmName}`
                : containerName;

            result[relName] = result[relName] ?? {};
            result[relName][(value ? value : elmName) as keyof Relationship] =
                next[1];

            return result;
        },
        {},
    );
};

const resolveRelationshipPromises = async <T>(
    relationshipPromises: QuestionsObject<T>,
): Promise<Record<string, string>> => {
    const relationshipMap = await Object.entries(relationshipPromises).reduce(
        async (answers, [name, prompt]) => {
            const acc = await answers;
            const answer = await prompt?.(acc);

            if (!answer || typeof answer !== "string") return acc;

            return {
                ...acc,
                [name]: answer,
            };
        },
        Promise.resolve({} as { [key: string]: string }),
    );

    return relationshipMap;
};

const archetypeRelationshipQuestion =
    (archetypeRelationships: WorkspaceElement[], relName: string) =>
    async () => {
        const archetypeAnswer = await select<WorkspaceElement | "custom">({
            message: `Archetype relationship for ${relName}:`,
            choices: [
                ...archetypeRelationships.map((archetype) => ({
                    name: archetype.name.split("_")[1],
                    value: archetype,
                })),
                new Separator(),
                {
                    name: "Custom",
                    value: "custom",
                },
            ],
        });

        if (archetypeAnswer === "custom") {
            return "custom";
        }

        return `--${archetypeAnswer.name.split("_")[1]}->`;
    };

const noCustomArchetypeRel = (
    answers: Record<string, unknown>,
    elementNamePascalCase: string,
) =>
    answers[`${elementNamePascalCase}_archetypeRelationship`] &&
    answers[`${elementNamePascalCase}_archetypeRelationship`] !== "custom";

export const resolveRelationshipForElement = async (
    relationshipName: string,
    elementName: string,
    {
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "incoming",
        defaultTechnology = "Web/HTTP",
        archetypeRelationships = [],
    }: RelationshipForElementOptions = {},
): Promise<Record<string, string>> => {
    const [containerName, maybeRelName] = relationshipName.split("_");
    const relName = maybeRelName ?? containerName;

    const elementNamePascalCase = maybeRelName
        ? `${pascalCase(removeSpaces(containerName))}_${pascalCase(removeSpaces(maybeRelName))}`
        : pascalCase(removeSpaces(containerName));

    const relationshipPromises = {
        [`${elementNamePascalCase}_relationshipType`]: () =>
            select({
                message: `Relationship type for ${relName}`,
                choices: [
                    {
                        name: `outgoing (${elementName} → ${relName})`,
                        value: "outgoing",
                    },
                    {
                        name: `incoming (${relName} → ${elementName})`,
                        value: "incoming",
                    },
                ],
                default: defaultRelationshipType,
            }),
        ...(archetypeRelationships.length
            ? {
                  [`${elementNamePascalCase}_archetypeRelationship`]:
                      archetypeRelationshipQuestion(
                          archetypeRelationships,
                          relName,
                      ),
              }
            : {
                  [`${elementNamePascalCase}_archetypeRelationship`]: () =>
                      Promise.resolve(""),
              }),
        [`${elementNamePascalCase}_relationship`]: (
            answers: Record<string, unknown>,
        ) => {
            if (noCustomArchetypeRel(answers, elementNamePascalCase)) {
                return Promise.resolve("");
            }

            return input({
                message: `Relationship with ${relName}:`,
                default: defaultRelationship,
            });
        },
        [`${elementNamePascalCase}_technology`]: (
            answers: Record<string, unknown>,
        ) => {
            if (noCustomArchetypeRel(answers, elementNamePascalCase)) {
                return Promise.resolve("");
            }

            return input({
                message: "Technology:",
                default: defaultTechnology,
            });
        },
    };

    return resolveRelationshipPromises(relationshipPromises);
};

export async function addRelationshipsToElement(
    elementName: string,
    workspaceInfo: StructurizrWorkspace | undefined,
    {
        validate = () => true,
        filterChoices = () => true,
        parse = defaultParser,
        message = "Relates to elements:",
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "outgoing",
        defaultTechnology = "Web/HTTP",
        includeContainers,
        includeComponents,
        workspacePath,
    }: AddRelationshipOptions = {},
): Promise<Record<string, Relationship>> {
    if (!workspaceInfo) return {};

    const elements = getAllWorkspaceElements(workspaceInfo, {
        includeContainers: !!includeContainers,
        includeComponents: !!includeComponents,
        includeDeploymentNodes: false,
    });

    const softwareSystems = elements.filter((elm) =>
        elm.tags?.includes("System"),
    );
    const people = elements.filter((elm) => elm.tags?.includes("Person"));
    const containers = elements.filter(
        (elm) =>
            elm.tags?.includes("Container") &&
            elm.systemName === includeContainers,
    );
    const components = elements.filter(
        (elm) =>
            elm.tags?.includes("Component") &&
            elm.containerName === includeComponents,
    );

    const systemElements = (
        [
            components.length &&
                separator(`Components (${includeComponents})`, components),
            ...components,
            containers.length &&
                separator(`Containers (${includeContainers})`, containers),
            ...containers,
            softwareSystems.length && separator("Systems", softwareSystems),
            ...softwareSystems,
            people.length && separator("People", people),
            ...people,
        ].filter(Boolean) as ((typeof elements)[number] | Separator)[]
    )
        .flat()
        .map((elm) =>
            elm instanceof Separator
                ? elm
                : {
                      name: `${labelElementByTags(elm.tags)} ${elm.name}`,
                      value: elm.containerName
                          ? `${elm.containerName}_${elm.name}`
                          : elm.name,
                  },
        )
        .filter(filterChoices);

    if (!systemElements.filter((elm) => !(elm instanceof Separator)).length) {
        return {};
    }

    const relationshipNames = await checkbox({
        message,
        choices: systemElements,
        validate,
    });

    if (!relationshipNames.length) return {};

    let relationshipsMap: Record<string, Relationship> = {};

    const availableRelationshipArchetypes = workspacePath
        ? await resolveAvailableArchetypeElements(
              workspacePath,
              Elements.Relationship,
          )
        : undefined;

    for await (const relationshipName of relationshipNames) {
        const relationship = await resolveRelationshipForElement(
            relationshipName,
            elementName,
            {
                defaultRelationship,
                defaultRelationshipType,
                defaultTechnology,
                archetypeRelationships: availableRelationshipArchetypes,
            },
        );

        relationshipsMap = {
            ...relationshipsMap,
            ...parse(relationship),
        };
    }

    return relationshipsMap;
}
