import { input } from "@inquirer/prompts";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { addRelationshipsToElement } from "../utils/questions/relationships";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition = {
    name: "System",
    description: "Create a new software system",
    questions: async (_, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemName = await input({
            message: "System Name:",
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedElements(workspaceInfo),
            )(),
        });

        const systemDescription = await input({
            message: "System Description:",
            default: "Untitled System",
            validate: stringEmpty,
        });

        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "incoming",
        };

        const relationships = await addRelationshipsToElement(
            systemName,
            workspaceInfo,
            relationshipDefaults,
        );

        const compiledAnswers = {
            systemName,
            systemDescription,
            elementName: systemName,
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/systems/{{kebabCase systemName}}.dsl",
            templateFile: "templates/system/system.hbs",
        } as AddAction,
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/containers/{{kebabCase systemName}}/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction,
        {
            type: "append",
            path: "architecture/relationships/_system.dsl",
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction,
        {
            type: "add",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            templateFile: "templates/views/system.hbs",
        } as AddAction,
    ],
};

export default generator;
