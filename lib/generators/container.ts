import { resolve } from "node:path";
import { Separator, input, select } from "@inquirer/prompts";
import { file } from "bun";
import { kebabCase, pascalCase } from "change-case";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { removeSpaces } from "../utils/handlebars";
import {
    type Relationship,
    addRelationshipsToElement,
} from "../utils/questions/relationships";
import { resolveSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    duplicatedSystemName,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type ContainerAnswers = {
    systemName: string;
    elementName: string;
    containerDescription: string;
    containerType: string;
    containerTechnology: string;
    includeTabs: string;
    includeSource: string;
    relationships: Record<string, Relationship>;
};

const generator: GeneratorDefinition<ContainerAnswers> = {
    name: "Container",
    description: "Create a new system container",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemName = await resolveSystemQuestion(
            workspaceInfo ?? generator.destPath,
            { message: "Parent system:" },
        );

        const elementName = await input({
            message: "Container Name:",
            required: true,
            validate: chainValidators<{ systemName: string }>(
                stringEmpty,
                duplicatedSystemName,
                validateDuplicatedElements(workspaceInfo),
            )({ systemName }),
        });

        const containerDescription = await input({
            message: "Container Description:",
            default: "Untitled Container",
            validate: stringEmpty,
        });

        const containerType = await select({
            message: "Container type:",
            default: "None of the above",
            choices: [
                { name: "EventBus", value: "EventBus" },
                { name: "MessageBroker", value: "MessageBroker" },
                { name: "Function", value: "Function" },
                { name: "Database", value: "Database" },
                { name: "WebApp", value: "WebApp" },
                { name: "MobileApp", value: "MobileApp" },
                { name: "None of the above", value: "None of the above" },
            ],
        });

        const containerTechnology = await input({
            message: "Container technology:",
        });

        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "incoming",
        };

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                filterChoices: (elm) =>
                    elm instanceof Separator || elm.value !== systemName,
                ...relationshipDefaults,
                includeContainers: systemName,
            },
        );

        const compiledAnswers = {
            systemName,
            elementName,
            containerDescription,
            containerType,
            containerTechnology,
            includeTabs: "",
            includeSource: `${kebabCase(systemName)}.dsl`,
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            type: "add",
            path: "architecture/containers/{{kebabCase systemName}}/{{kebabCase elementName}}.dsl",
            skipIfExists: true,
            templateFile: "templates/containers/container.hbs",
        } as AddAction<ContainerAnswers>,
        {
            type: "append",
            path: "architecture/relationships/_system.dsl",
            skip: async (answers, rootPath) => {
                const systemRelationshipsPath = resolve(
                    rootPath,
                    "architecture/relationships/_system.dsl",
                );

                const fileExists = await file(systemRelationshipsPath).exists();
                if (!fileExists) return false;
                const systemRelationships = await file(
                    systemRelationshipsPath,
                ).text();

                const match = new RegExp(
                    `include ${kebabCase(answers.systemName)}`,
                    "g",
                ).test(systemRelationships);

                return (
                    match &&
                    `Container relationship for "${answers.systemName}" already included`
                );
            },
            pattern: /.*\r?\n!include.*/,
            templateFile: "templates/include.hbs",
        } as AppendAction<ContainerAnswers>,
        {
            type: "append",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            skip: async (answers, rootPath) => {
                const systemViewPath = resolve(
                    rootPath,
                    `architecture/views/${kebabCase(answers.systemName)}.dsl`,
                );

                const fileExists = await file(systemViewPath).exists();
                if (!fileExists) return false;
                const systemView = await file(systemViewPath).text();

                const match = new RegExp(
                    `container ${pascalCase(removeSpaces(answers.systemName))}`,
                    "g",
                ).test(systemView);

                return (
                    match &&
                    `Container view for "${answers.systemName}" already exists`
                );
            },
            templateFile: "templates/views/container.hbs",
        } as AppendAction<ContainerAnswers>,
        {
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<ContainerAnswers>,
    ],
};

export default generator;
