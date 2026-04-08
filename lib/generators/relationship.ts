import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import {
    Elements,
    elementTypeByTags,
    labelElementByTags,
} from "../utils/labels";
import { Separator, select } from "../utils/prompts";
import {
    addRelationshipsToElement,
    componentParser,
    type Relationship,
} from "../utils/questions/relationships";
import { getAllWorkspaceElements } from "../utils/questions/system";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type RelationshipAnswers = {
    elementName: string;
    systemName?: string;
    containerName?: string;
    elementType: string;
    relationships: Record<string, Relationship>;
    workspaceScope?: string;
};

const generator: GeneratorDefinition<RelationshipAnswers> = {
    name: Elements.Relationship,
    description: "Create a new relationship between elements",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemElements = getAllWorkspaceElements(workspaceInfo, {
            includeContainers: true,
            includeComponents: true,
            includeDeploymentNodes: false,
        }).map((elm) => {
            const key = [
                elementTypeByTags(elm.tags),
                elm.systemName,
                elm.containerName,
                elm.name,
            ]
                .filter(Boolean)
                .join("/");
            return {
                name: `${labelElementByTags(elm.tags)} ${
                    elm.systemName ? `${elm.systemName}/` : ""
                }${elm.containerName ? `${elm.containerName}/` : ""}${elm.name}`,
                value: key,
                _elm: elm,
            };
        });

        const elementKey = await select<string>({
            name: "element",
            message: "Element:",
            choices: systemElements.map(({ name, value }) => ({
                name,
                value,
            })),
        });

        const selected = systemElements.find((e) => e.value === elementKey);
        if (!selected) {
            throw new Error(`Element "${elementKey}" not found in workspace`);
        }

        const element = {
            elementName: selected._elm.name,
            systemName: selected._elm.systemName,
            containerName: selected._elm.containerName,
            elementType: elementTypeByTags(selected._elm.tags),
        };

        const relationships = await addRelationshipsToElement(
            element.elementName,
            workspaceInfo,
            {
                workspacePath: getWorkspacePath(generator.destPath),
                includeContainers: element.systemName
                    ? element.systemName
                    : undefined,
                includeComponents: element.containerName
                    ? element.containerName
                    : undefined,
                filterChoices: (elm) => {
                    if (elm instanceof Separator) return true;

                    // Component
                    if (element.containerName) {
                        return (
                            elm.value !==
                                `${element.containerName}_${element.elementName}` &&
                            elm.value !== element.containerName &&
                            elm.value !== element.systemName
                        );
                    }

                    // Container
                    if (element.systemName) {
                        // return only those whose value is neither system name nor element name
                        return (
                            elm.value !== element.systemName &&
                            elm.value !== element.elementName
                        );
                    }

                    // All other cases
                    return element.elementName !== elm.value;
                },

                parse: componentParser,
            },
        );

        const isPerson = element.elementType === Elements.Person;
        const isExternalSystem =
            element.elementType === Elements.ExternalSystem;

        const compiledAnswers = {
            ...element,
            workspaceScope: workspaceInfo?.configuration.scope?.toLowerCase(),
            elementType: isPerson
                ? "people"
                : isExternalSystem
                  ? "external"
                  : element.elementType,
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            when: (answers) =>
                ["people", "external", "system"].includes(answers.elementType),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No system relationships",
            type: "append",
            path: "architecture/relationships/_{{kebabCase elementType}}.dsl",
            pattern: /\r?\n.* -> .*\r?\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope === "landscape" &&
                !["people", "external"].includes(answers.elementType),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No system relationships",
            type: "append",
            path: "architecture/relationships/landscape.dsl",
            pattern: /\r?\n.* -> .*\r?\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope === "softwaresystem" &&
                Boolean(answers.systemName && !answers.containerName),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No container relationships",
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/_system.dsl",
            pattern: /[\s\S]*\r?\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope === "softwaresystem" &&
                Boolean(answers.systemName && answers.containerName),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No component relationships",
            type: "append",
            pattern: /[\s\S]*\r?\n/,
            path: "architecture/relationships/_system.dsl",
            templateFile: "templates/relationships/multiple-component.hbs",
        } as AppendAction<RelationshipAnswers>,
    ],
};

export default generator;
