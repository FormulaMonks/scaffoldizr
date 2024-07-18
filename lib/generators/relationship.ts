import { select } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { elementTypeByTags, labelElementByTags } from "../utils/labels";
import {
    type Relationship,
    addRelationshipsToElement,
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
    name: "Relationship",
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
            }${elm.name}`,
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
            },
        );

        const compiledAnswers = {
            ...element,
            elementType:
                // TODO: Implement Component Relationships
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
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) => Boolean(answers.systemName),
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No container relationships",
            type: "append",
            createIfNotExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
        {
            when: (answers) => Boolean(answers.containerName),
            skip: (_) => true && "TODO: Implement",
            type: "append",
            path: "architecture/relationships/_{{kebabCase elementType}}.dsl",
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<RelationshipAnswers>,
    ],
};

export default generator;
