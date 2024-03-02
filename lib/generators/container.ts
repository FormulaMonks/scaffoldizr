import { resolve } from "node:path";
import { file } from "bun";
import { kebabCase, pascalCase } from "change-case";
import type { QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { getRelationships } from "../utils/questions/relationships";
import { getSystemQuestion } from "../utils/questions/system";
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
    containerTechnology?: string;
};

const generator: GeneratorDefinition<ContainerAnswers> = {
    name: "Container",
    description: "Create a new system container",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );
        const systemQuestion = await getSystemQuestion(
            workspaceInfo ?? generator.destPath,
            {
                message: "Parent system:",
            },
        );

        const questions: QuestionCollection<ContainerAnswers> = [
            systemQuestion,
            {
                type: "input",
                name: "elementName",
                message: "Container Name:",
                validate: chainValidators(
                    stringEmpty,
                    duplicatedSystemName,
                    validateDuplicatedElements(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "containerDescription",
                message: "Container Description:",
                default: "Untitled Container",
                validate: stringEmpty,
            },
            {
                type: "list",
                name: "containerType",
                message: "Container type:",
                choices: [
                    "EventBus",
                    "MessageBroker",
                    "Function",
                    "Database",
                    "WebApp",
                    "MobileApp",
                    "None of the above",
                ],
            },
            {
                type: "input",
                name: "containerTechnology",
                message: "Container technology:",
            },
        ];

        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "incoming",
        };

        const partialAnswers = await prompt(questions);
        const relationships = await getRelationships(
            partialAnswers.elementName,
            workspaceInfo,
            prompt,
            {
                ...relationshipDefaults,
                includeContainers: partialAnswers.systemName,
            },
        );

        const compiledAnswers = {
            ...partialAnswers,
            includeTabs: "",
            includeSource: `${kebabCase(partialAnswers.systemName)}.dsl`,
            relationships: { ...relationships },
        };

        return compiledAnswers;
    },
    actions: [
        {
            type: "add",
            path: "architecture/containers/{{kebabCase systemName}}/{{kebabCase elementName}}.dsl",
            skipIfExists: true,
            templateFile: "templates/containers/container.hbs",
        } as AddAction,
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
                    `Container relationship for "${answers.systemName}" already included.`
                );
            },
            templateFile: "templates/include.hbs",
        } as AppendAction,
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
                    `container ${pascalCase(
                        answers.systemName.replace(/\s/g, ""),
                    )}`,
                    "g",
                ).test(systemView);

                return (
                    match &&
                    `Container view for "${answers.systemName}" already exists.`
                );
            },
            templateFile: "templates/views/container.hbs",
        } as AppendAction,
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AddAction,
        {
            type: "append",
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction,
    ],
};

export default generator;
