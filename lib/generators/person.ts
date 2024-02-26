import { resolve } from "node:path";
import { file } from "bun";
import { kebabCase } from "change-case";
import type { QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { getSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    duplicatedSystemName,
    stringEmpty,
    validateDuplicates,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type PersonAnswers = {
    systemName: string;
    elementName: string;
    personDescription: string;
    relationship: string;
    relationshipType: "outgoing" | "incoming";
};

const whenFileExists = async (
    filePath: string,
    workspacePath: string | undefined,
): Promise<boolean | string> => {
    if (!workspacePath) return false;
    const foundFile = file(resolve(workspacePath, filePath));

    return foundFile.size > 0;
};

const constantGenerator: GeneratorDefinition<PersonAnswers> = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (prompt, generator) => {
        const systemQuestion = await getSystemQuestion(generator.destPath);
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const questions: QuestionCollection<PersonAnswers> = [
            systemQuestion,
            {
                type: "input",
                name: "elementName",
                message: "Person name:",
                validate: chainValidators(
                    stringEmpty,
                    duplicatedSystemName,
                    validateDuplicates(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "personDescription",
                message: "Person description:",
                default: "Default user",
            },
            {
                type: "input",
                name: "relationship",
                message: "Relationship:",
                default: "Consumes",
            },
            {
                type: "list",
                name: "relationshipType",
                message: "Relationship type:",
                choices: [
                    {
                        name: "outgoing (System → Person)",
                        value: "outgoing",
                    },
                    {
                        name: "incoming (Person → System)",
                        value: "incoming",
                    },
                ],
                default: "incoming",
            },
        ];

        return prompt(questions);
    },
    actions: [
        {
            when: (_answers, rootPath) =>
                whenFileExists(
                    "systems/_people.dsl",
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/systems/_people.dsl",
            templateFile: "templates/system/person.hbs",
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
            path: "architecture/systems/_people.dsl",
            templateFile: "templates/system/person.hbs",
        } as AddAction,
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/{{kebabCase systemName}}.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        } as AddAction,
    ],
};

export default constantGenerator;
