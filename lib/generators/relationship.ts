import { select } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { elementTypeByTags, labelElementByTags } from "../utils/labels";
import { addRelationshipsToElement } from "../utils/questions/relationships";
import { getAllSystemElements } from "../utils/questions/system";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition = {
    name: "Relationship",
    description: "Create a new relationship between elements",
    questions: async (_, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemElements = getAllSystemElements(workspaceInfo, {
            includeContainers: true,
            includeDeploymentNodes: false,
        }).map((elm) => ({
            name: `${labelElementByTags(elm.tags)} ${
                elm.systemName ? `${elm.systemName}/` : ""
            }${elm.name}`,
            value: {
                elementName: elm.name,
                systemName: elm.systemName,
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
            when: (answers) => answers.elementType !== "Container",
            skip: (answers) =>
                Object.keys(answers.relationships).length <= 0 &&
                "No system relationships",
            type: "append",
            path: "architecture/relationships/_{{kebabCase elementType}}.dsl",
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction,
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
        } as AppendAction,
    ],
};

export default generator;
