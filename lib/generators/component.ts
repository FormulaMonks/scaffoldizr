import { resolve } from "node:path";
import { Separator, input, select } from "@inquirer/prompts";
import { file } from "bun";
import chalk from "chalk";
import { kebabCase, pascalCase } from "change-case";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { removeSpaces } from "../utils/handlebars";
import {
    type Relationship,
    addRelationshipsToElement,
    componentParser,
} from "../utils/questions/relationships";
import { getAllWorkspaceElements } from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedComponentName,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type ComponentAnswers = {
    systemName: string;
    containerName: string;
    elementName: string;
    componentDescription: string;
    componentTechnology: string;
    includeTabs: string;
    includeSource: string;
    relationships: Record<string, Relationship>;
};

const generator: GeneratorDefinition<ComponentAnswers> = {
    name: "Component",
    description: "Create a new component for a container",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const containers = getAllWorkspaceElements(workspaceInfo, {
            includeContainers: true,
            includeComponents: true,
        }).filter((elm) => elm.tags.includes("Container"));

        if (!containers.length) {
            console.log(
                `${chalk.red(
                    "[ERROR]:",
                )} No containers found in the workspace. Please create a container first.`,
            );

            process.exit(1);
        }

        const container = await select({
            message: "Container:",
            choices: containers.map((elm) => ({
                name: `${elm.systemName ? `${elm.systemName}/` : ""}${elm.name}`,
                value: elm,
            })),
        });

        if (!container.systemName) {
            throw new Error("Selected container does not belong to a system");
        }

        const elementName = await input({
            message: "Component Name:",
            required: true,
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedComponentName(workspaceInfo, container.name),
            )(),
        });

        const componentDescription = await input({
            message: "Component Description:",
            default: "Untitled Component",
            validate: stringEmpty,
        });

        const componentTechnology = await input({
            message: "Component technology:",
        });

        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "outgoing",
        };

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                includeContainers: container.systemName,
                includeComponents: container.name,
                filterChoices: (elm) =>
                    elm instanceof Separator ||
                    (elm.value !== container.name &&
                        elm.value !== container.systemName),
                parse: componentParser,
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            systemName: container.systemName,
            containerName: container.name,
            elementName,
            componentDescription,
            componentTechnology,
            includeTabs: "    ",
            includeSource: `../../components/${kebabCase(container.systemName)}--${kebabCase(container.name)}.dsl\n`,
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            type: "append",
            path: "architecture/components/{{kebabCase systemName}}--{{kebabCase containerName}}.dsl",
            createIfNotExists: true,
            pattern: /[\s\S]*\n/,
            templateFile: "templates/components/component.hbs",
        } as AppendAction<ComponentAnswers>,
        {
            type: "append",
            path: "architecture/containers/{{kebabCase systemName}}/{{kebabCase containerName}}.dsl",
            skip: async (answers, rootPath) => {
                const containerPath = resolve(
                    rootPath,
                    `architecture/containers/${kebabCase(answers.systemName)}/${kebabCase(answers.containerName)}.dsl`,
                );

                const fileExists = await file(containerPath).exists();
                if (!fileExists) return false;

                const containerIncludes = await file(containerPath).text();
                const match = new RegExp(
                    `include ${answers.includeSource.trim()}`,
                    "g",
                ).test(containerIncludes);

                return (
                    match &&
                    `Component relationship for "${answers.containerName}" already included`
                );
            },
            pattern: /.*{\n/,
            templateFile: "templates/include.hbs",
        } as AppendAction<ComponentAnswers>,
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
                    `component ${pascalCase(removeSpaces(answers.containerName))}`,
                    "g",
                ).test(systemView);

                return (
                    match &&
                    `Component view for "${answers.containerName}" already exists`
                );
            },
            templateFile: "templates/views/component.hbs",
        } as AppendAction<ComponentAnswers>,
        {
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/multiple-component.hbs",
        } as AppendAction<ComponentAnswers>,
    ],
};

export default generator;
