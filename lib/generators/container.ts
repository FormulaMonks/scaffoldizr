import { resolve } from "node:path";
import { input, Separator, select } from "@inquirer/prompts";
import { file } from "bun";
import { kebabCase, pascalCase } from "change-case";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { removeSpaces } from "../utils/handlebars";
import { Elements } from "../utils/labels";
import { resolveAvailableArchetypeElements } from "../utils/questions/archetypes";
import {
    addRelationshipsToElement,
    type Relationship,
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
    archetype?: string;
    workspaceScope?: string;
};

const generator: GeneratorDefinition<ContainerAnswers> = {
    name: Elements.Container,
    description: "Create a new system container",
    questions: async (generator) => {
        const workspacePath = getWorkspacePath(generator.destPath);
        const workspaceInfo = await getWorkspaceJson(workspacePath);

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

        const availableContainerArchetypes = workspacePath
            ? await resolveAvailableArchetypeElements(
                  workspacePath,
                  Elements.Container,
              )
            : undefined;

        const archetype = availableContainerArchetypes?.length
            ? await select<string | "custom">({
                  message: `Archetype container for ${elementName}:`,
                  choices: [
                      ...availableContainerArchetypes.map((archetype) => ({
                          name: archetype.name.split("_")[1],
                          value: archetype.name.split("_")[1],
                      })),
                      new Separator(),
                      {
                          name: "Custom",
                          value: "custom",
                      },
                  ],
              })
            : "custom";

        const containerDescription =
            archetype === "custom"
                ? await input({
                      message: "Container Description:",
                      default: "Untitled Container",
                      validate: stringEmpty,
                  })
                : "";

        const containerType =
            archetype === "custom"
                ? await select({
                      message: "Container type:",
                      default: "None of the above",
                      choices: [
                          { name: "EventBus", value: "EventBus" },
                          { name: "MessageBroker", value: "MessageBroker" },
                          { name: "Function", value: "Function" },
                          { name: "Database", value: "Database" },
                          { name: "WebApp", value: "WebApp" },
                          { name: "MobileApp", value: "MobileApp" },
                          {
                              name: "None of the above",
                              value: "None of the above",
                          },
                      ],
                  })
                : "";

        const containerTechnology =
            archetype === "custom"
                ? await input({
                      message: "Container technology:",
                  })
                : "";

        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "incoming",
        };

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                workspacePath,
                filterChoices: (elm) =>
                    elm instanceof Separator || elm.value !== systemName,
                ...relationshipDefaults,
                includeContainers: systemName,
            },
        );

        const compiledAnswers = {
            workspaceScope: workspaceInfo?.configuration.scope?.toLowerCase(),
            systemName,
            elementName,
            archetype: archetype === "custom" ? undefined : archetype,
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
            when: (answers) => answers.workspaceScope === "softwaresystem",
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/_system.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<ContainerAnswers>,
    ],
};

export default generator;
