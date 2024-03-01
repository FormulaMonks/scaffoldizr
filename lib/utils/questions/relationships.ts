import { pascalCase } from "change-case";
import type {
    Answers,
    AsyncDynamicQuestionProperty,
    PromptModule,
} from "inquirer";
import inquirer from "inquirer";
import { removeSpaces } from "../../../src/utils/helpers.mjs";
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

type GetRelationshipsOptions = {
    when?: AsyncDynamicQuestionProperty<boolean, Answers>;
    filterChoices?: (
        elm: inquirer.Separator | { name: string; value: string },
        pos: number,
        arr: unknown[],
    ) => boolean;
    parse?: typeof defaultParser;
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

const identifyElementByTags = (tags: string): string => {
    for (const tag of tags.split(",")) {
        if (tag === "Person") return "👤";
        if (tag === "External") return "⚪️";
        if (tag === "Container") return "🔹";
    }

    return "🔵";
};

export async function getRelationships(
    elementName: string,
    workspaceInfo: StructurizrWorkspace | undefined,
    prompt: PromptModule,
    {
        when = () => true,
        filterChoices = () => true,
        parse = defaultParser,
        message = "Relates to elements:",
        defaultRelationship = "Interacts with",
        defaultRelationshipType = "outgoing",
        defaultTechnology = "Web/HTTP",
    }: GetRelationshipsOptions = {},
): Promise<Record<string, Relationship>> {
    if (!workspaceInfo) return {};

    const softwareSystems = workspaceInfo.model?.softwareSystems ?? [];
    const people = workspaceInfo.model?.people ?? [];

    const systemElements = (
        [
            softwareSystems.length
                ? new inquirer.Separator("-- Systems --")
                : [],
            ...softwareSystems,
            people.length ? new inquirer.Separator("-- People --") : [],
            ...people,
        ] as (SoftwareElement | inquirer.Separator)[]
    )
        .flat()
        .map((elm) =>
            elm instanceof inquirer.Separator
                ? elm
                : {
                      name: `${identifyElementByTags(elm.tags)} ${elm.name}`,
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
