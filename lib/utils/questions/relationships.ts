import { pascalCase } from "change-case";
import type { Answers, PromptModule, Question } from "inquirer";
import inquirer from "inquirer";
import { removeSpaces } from "../handlebars";
import { labelElementByTags } from "../labels";
import type { StructurizrWorkspace } from "../workspace";

type Relationship = {
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

type GetRelationshipsOptions = {
    when?: Question<Answers>["when"];
    validate?: Question<Answers>["validate"];
    filterChoices?: (
        elm: inquirer.Separator | { name: string; value: string },
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

export const relationshipsForElement = (
    relationshipName: string,
    elementName: string,
    {
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "incoming",
        defaultTechnology = "Web/HTTP",
    }: RelationshipForElementOptions = {},
) => {
    const elementNamePascalCase = pascalCase(removeSpaces(relationshipName));

    return [
        {
            type: "list",
            name: `${elementNamePascalCase}_relationshipType`,
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
        },
        {
            type: "input",
            name: `${elementNamePascalCase}_relationship`,
            message: `Relationship with ${relationshipName}:`,
            default: defaultRelationship,
        },
        {
            type: "input",
            name: `${elementNamePascalCase}_technology`,
            message: "Technology:",
            default: defaultTechnology,
        },
    ];
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
): inquirer.Separator | unknown[] => {
    const maybeSeparator = elements.length
        ? new inquirer.Separator(`-- ${name} --`)
        : [];

    return maybeSeparator;
};

export async function getRelationships(
    elementName: string,
    workspaceInfo: StructurizrWorkspace | undefined,
    prompt: PromptModule,
    {
        when = () => true,
        validate = () => true,
        filterChoices = () => true,
        parse = defaultParser,
        message = "Relates to elements:",
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "outgoing",
        defaultTechnology = "Web/HTTP",
        includeContainers,
    }: GetRelationshipsOptions = {},
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
        ] as (SoftwareElement | inquirer.Separator)[]
    )
        .flat()
        .map((elm) =>
            elm instanceof inquirer.Separator
                ? elm
                : {
                      name: `${labelElementByTags(elm.tags)} ${elm.name}`,
                      value: elm.name,
                  },
        )
        .filter(filterChoices);

    if (
        !systemElements.filter((elm) => !(elm instanceof inquirer.Separator))
            .length
    )
        return {};

    const { relationships } = await prompt({
        type: "checkbox",
        name: "relationships",
        message,
        choices: systemElements,
        when,
        validate,
    });

    if (!relationships.length) return {};

    const relationshipQuestions = relationships.flatMap((name: string) => {
        return relationshipsForElement(name, elementName, {
            defaultRelationship,
            defaultRelationshipType,
            defaultTechnology,
        });
    });

    const relationshipMap = await prompt(relationshipQuestions);

    return parse(relationshipMap);
}
