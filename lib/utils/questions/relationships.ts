import { Separator, checkbox, input, select } from "@inquirer/prompts";
import { pascalCase } from "change-case";
import type { QuestionsObject } from "../generator";
import { removeSpaces } from "../handlebars";
import { labelElementByTags } from "../labels";
import type { StructurizrWorkspace } from "../workspace";

export type Relationship = {
    relationship: string;
    relationshipType: string;
    technology: string;
};

type RelationshipForElementOptions = {
    defaultRelationship?: string;
    defaultRelationshipType?: string;
    defaultTechnology?: string;
};

type Model = StructurizrWorkspace["model"];
type SoftwareElement = Model["people"][number];
type SoftwareSystem = Model["softwareSystems"][number];

type AddRelationshipOptions = {
    validate?: Parameters<typeof checkbox>[0]["validate"];
    filterChoices?: (
        elm: Separator | { name: string; value: string },
        pos: number,
        arr: unknown[],
    ) => boolean;
    parse?: typeof defaultParser;
    includeContainers?: string;
    message?: string;
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

const resolveRelationshipPromises = async (
    relationshipPromises: QuestionsObject<string>,
): Promise<Record<string, string>> => {
    const relationshipMap = await Object.entries(relationshipPromises).reduce(
        async (answers, [name, prompt]) => {
            const acc = await answers;
            const answer = await prompt?.();

            if (!answer) return acc;

            return {
                ...acc,
                [name]: answer,
            };
        },
        Promise.resolve({} as { [key: string]: string }),
    );

    return relationshipMap;
};

export const resolveRelationshipForElement = async (
    relationshipName: string,
    elementName: string,
    {
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "incoming",
        defaultTechnology = "Web/HTTP",
    }: RelationshipForElementOptions = {},
): Promise<Record<string, string>> => {
    const elementNamePascalCase = pascalCase(removeSpaces(relationshipName));

    const relationshipPromises = {
        [`${elementNamePascalCase}_relationshipType`]: () =>
            select({
                message: `Relationship type for ${relationshipName}`,
                choices: [
                    {
                        name: `outgoing (${elementName} → ${relationshipName})`,
                        value: "outgoing",
                    },
                    {
                        name: `incoming (${relationshipName} → ${elementName})`,
                        value: "incoming",
                    },
                ],
                default: defaultRelationshipType,
            }),
        [`${elementNamePascalCase}_relationship`]: () =>
            input({
                message: `Relationship with ${relationshipName}:`,
                default: defaultRelationship,
            }),
        [`${elementNamePascalCase}_technology`]: () =>
            input({
                message: "Technology:",
                default: defaultTechnology,
            }),
    };

    return resolveRelationshipPromises(relationshipPromises);
};

const findSystemContainers = (
    systemName: string,
    systems: SoftwareSystem[],
): SoftwareSystem["containers"] => {
    const containers =
        systems.find(({ name }) => name === systemName)?.containers ?? [];

    return containers;
};

const separator = (
    name: string,
    elements: unknown[],
): Separator | unknown[] => {
    const maybeSeparator = elements.length
        ? new Separator(`-- ${name} --`)
        : [];

    return maybeSeparator;
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
    }: AddRelationshipOptions = {},
): Promise<Record<string, Relationship>> {
    if (!workspaceInfo) return {};

    const softwareSystems = workspaceInfo.model?.softwareSystems ?? [];
    const people = workspaceInfo.model?.people ?? [];
    const containers = includeContainers
        ? findSystemContainers(
              includeContainers,
              workspaceInfo.model?.softwareSystems,
          )
        : [];

    const systemElements = (
        [
            separator(`Containers (${includeContainers})`, containers),
            ...containers,
            separator("Systems", softwareSystems),
            ...softwareSystems,
            separator("People", people),
            ...people,
        ] as (SoftwareElement | Separator)[]
    )
        .flat()
        .map((elm) =>
            elm instanceof Separator
                ? elm
                : {
                      name: `${labelElementByTags(elm.tags)} ${elm.name}`,
                      value: elm.name,
                  },
        )
        .filter(filterChoices);

    if (!systemElements.filter((elm) => !(elm instanceof Separator)).length)
        return {};

    const relationshipNames = await checkbox({
        message,
        choices: systemElements,
        validate,
    });

    if (!relationshipNames.length) return {};

    const relationshipsMap: Record<string, Relationship> = {};

    for await (const relationshipName of relationshipNames) {
        const relationship = await resolveRelationshipForElement(
            relationshipName,
            elementName,
            { defaultRelationship, defaultRelationshipType, defaultTechnology },
        );

        const elementNamePascalCase = pascalCase(
            removeSpaces(relationshipName),
        );

        relationshipsMap[elementNamePascalCase] =
            parse(relationship)[elementNamePascalCase];
    }

    return relationshipsMap;
}
