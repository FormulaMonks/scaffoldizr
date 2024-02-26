import { kebabCase } from "change-case";
import type { QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
import { whenFileExists } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import { getSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    duplicatedSystemName,
    stringEmpty,
    validateDuplicates,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type ExternalSystemAnswers = {
    systemName: string;
    elementName: string;
    extSystemDescription: string;
    relationship: string;
    relationshipType: "outgoing" | "incoming";
};

const generator: GeneratorDefinition<ExternalSystemAnswers> = {
    name: "External System",
    description: "Create a new external system",
    questions: async (prompt, generator) => {
        const systemQuestion = await getSystemQuestion(generator.destPath);
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const questions: QuestionCollection<ExternalSystemAnswers> = [
            systemQuestion,
            {
                type: "input",
                name: "elementName",
                message: "External system name:",
                validate: chainValidators(
                    stringEmpty,
                    duplicatedSystemName,
                    validateDuplicates(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "extSystemDescription",
                message: "System description:",
                default: "Untitled System",
            },
            {
                type: "input",
                name: "relationship",
                message: "Relationship:",
                default: "Interacts with",
            },
            {
                type: "list",
                name: "relationshipType",
                message: "Relationship type:",
                choices: [
                    {
                        name: "outgoing (System → ExtSystem)",
                        value: "outgoing",
                    },
                    {
                        name: "incoming (ExtSystem → System)",
                        value: "incoming",
                    },
                ],
                default: "outgoing",
            },
        ];

        return prompt(questions);
    },
    actions: [
        {
            when: (_answers, rootPath) =>
                whenFileExists(
                    "systems/_external.dsl",
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/systems/_external.dsl",
            templateFile: "templates/system/external.hbs",
        } as AppendAction,
        {
            when: (answers, rootPath) =>
                whenFileExists(
                    `relationships/${kebabCase(answers.systemName)}.dsl`,
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        } as AppendAction,
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/systems/_external.dsl",
            templateFile: "templates/system/external.hbs",
        } as AddAction,
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        } as AddAction,
    ],
};

export default generator;
