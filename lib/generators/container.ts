import { resolve } from "node:path";
import { file } from "bun";
import { kebabCase, pascalCase } from "change-case";
import type { QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
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
    containerName: string;
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

        return prompt(questions);
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
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            skip: async (answers, rootPath) => {
                const systemViewPath = resolve(
                    rootPath,
                    `views/${kebabCase(answers.systemName)}.dsl`,
                );

                const fileExists = await file(systemViewPath).exists();
                if (!fileExists) return false;
                const systemView = await file(systemViewPath).text();

                const match = new RegExp(
                    `container ${pascalCase(answers.systemName)}`,
                    "g",
                ).test(systemView.toString());

                return match && "Skipped: Container view already exists.";
            },
            templateFile: "templates/views/container.hbs",
        } as AppendAction,
        // {
        //     type: "add",
        //     skipIfExists: true,
        //     path: "architecture/relationships/{{kebabCase elementName}}.dsl",
        //     templateFile: "templates/relationships/multiple.hbs",
        // } as AddAction,
    ],
};

export default generator;
