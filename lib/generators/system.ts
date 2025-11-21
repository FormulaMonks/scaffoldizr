import { input } from "@inquirer/prompts";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import {
    addRelationshipsToElement,
    type Relationship,
} from "../utils/questions/relationships";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type SystemAnswers = {
    systemName: string;
    systemDescription: string;
    elementName: string;
    relationships: Record<string, Relationship>;
    workspaceScope?: string;
};

const generator: GeneratorDefinition<SystemAnswers> = {
    name: Elements.System,
    description: "Create a new software system",
    questions: async (generator) => {
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
            workspaceScope: workspaceInfo?.configuration.scope,
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
        } as AddAction<SystemAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope?.toLowerCase() === "softwaresystem",
            type: "add",
            skipIfExists: true,
            path: "architecture/containers/{{kebabCase systemName}}/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<SystemAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope?.toLowerCase() === "softwaresystem",
            type: "append",
            path: "architecture/relationships/_system.dsl",
            pattern: /\n.* -> .*\n/,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<SystemAnswers>,
        {
            when: (answers) =>
                answers.workspaceScope?.toLowerCase() === "landscape",
            type: "append",
            path: "architecture/relationships/landscape.dsl",
            pattern: /\n.* -> .*\n/,
            createIfNotExists: true,
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<SystemAnswers>,
        {
            type: "add",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            templateFile: "templates/views/system.hbs",
        } as AddAction<SystemAnswers>,
    ],
};

export default generator;
