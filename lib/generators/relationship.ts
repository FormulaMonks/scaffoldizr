import { Separator, select } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import {
    Elements,
    elementTypeByTags,
    labelElementByTags,
} from "../utils/labels";
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
        }).map((elm) => ({
            name: `${labelElementByTags(elm.tags)} ${
                elm.systemName ? `${elm.systemName}/` : ""
            }${elm.containerName ? `${elm.containerName}/` : ""}${elm.name}`,
            value: {
                elementName: elm.name,
                systemName: elm.systemName,
                containerName: elm.containerName,
                elementType: elementTypeByTags(elm.tags),
            },
        }));

        const element = await select({
            message: "Element:",
            choices: systemElements,
        });

        const relationships = await addRelationshipsToElement(
            element.elementName,
            workspaceInfo,
            {
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

        const compiledAnswers = {
            ...element,
            elementType:
                element.elementType === "Person"
                    ? "people"
                    : element.elementType,
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            when: (answers) =>
                !["Container", "Component"].includes(answers.elementType),
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
                Boolean(answers.systemName && !answers.containerName),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No container relationships",
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            pattern: /[\s\S]*\r?\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) =>
                Boolean(answers.systemName && answers.containerName),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No component relationships",
            type: "append",
            pattern: /[\s\S]*\r?\n/,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/multiple-component.hbs",
        } as AppendAction<RelationshipAnswers>,
    ],
};

export default generator;
