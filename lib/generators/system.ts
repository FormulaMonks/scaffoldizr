import type { Answers, QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { getRelationships } from "../utils/questions/relationships";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition<Answers> = {
    name: "System",
    description: "Create a new software system",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );
        const questions: QuestionCollection<Answers> = [
            {
                type: "input",
                name: "systemName",
                message: "System Name:",
                validate: chainValidators(
                    stringEmpty,
                    validateDuplicatedElements(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "systemDescription",
                message: "System Description:",
                default: "Untitled System",
                validate: stringEmpty,
            },
        ];
        const relationshipDefaults = {
            defaultRelationship: "Uses",
            defaultRelationshipType: "incoming",
        };

        const partialAnswers = await prompt(questions);
        const relationships = await getRelationships(
            partialAnswers.systemName,
            workspaceInfo,
            prompt,
            {
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            ...partialAnswers,
            elementName: partialAnswers.systemName,
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
