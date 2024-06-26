import type { Answers, QuestionCollection } from "inquirer";
import inquirer from "inquirer";
import type { AppendAction } from "../utils/actions";
import { whenFileExists } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import {
    defaultParser,
    getRelationships,
    relationshipsForElement,
} from "../utils/questions/relationships";
import { getSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    duplicatedSystemName,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition<Answers> = {
    name: "External System",
    description: "Create a new external system",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );
        const systemQuestion = await getSystemQuestion(
            workspaceInfo ?? generator.destPath,
        );

        const questions: QuestionCollection<Answers> = [
            systemQuestion,
            {
                type: "input",
                name: "elementName",
                message: "External system name:",
                validate: chainValidators(
                    stringEmpty,
                    duplicatedSystemName,
                    validateDuplicatedElements(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "extSystemDescription",
                message: "System description:",
                default: "Untitled System",
            },
        ];

        const partialAnswers = await prompt(questions);
        const relationshipDefaults = {
            defaultRelationship: "Interacts with",
            defaultRelationshipType: "incoming",
        };

        const relationshipWithSystem = await prompt(
            relationshipsForElement(
                partialAnswers.systemName,
                partialAnswers.elementName,
                relationshipDefaults,
            ),
        );

        const mainRelationship = defaultParser(relationshipWithSystem);
        const relationships = await getRelationships(
            partialAnswers.elementName,
            workspaceInfo,
            prompt,
            {
                filterChoices: (elm) =>
                    elm instanceof inquirer.Separator ||
                    elm.value !== partialAnswers.systemName,
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            ...partialAnswers,
            includeSource: "relationships/_external.dsl",
            includeTabs: "        ",
            relationships: { ...mainRelationship, ...relationships },
        };

        return compiledAnswers;
    },
    actions: [
        {
            skip: (_answers, rootPath) =>
                whenFileExists(
                    "relationships/_external.dsl",
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Relationships/,
            templateFile: "templates/include.hbs",
        } as AppendAction,
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/systems/_external.dsl",
            templateFile: "templates/system/external.hbs",
        } as AppendAction,
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/relationships/_external.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction,
    ],
};

export default generator;
