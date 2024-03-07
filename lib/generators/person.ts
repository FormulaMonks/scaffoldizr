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
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition<Answers> = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const questions: QuestionCollection<Answers> = [
            await getSystemQuestion(workspaceInfo ?? generator.destPath),
            {
                type: "input",
                name: "elementName",
                message: "Person name:",
                validate: chainValidators(
                    stringEmpty,
                    validateDuplicatedElements(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "personDescription",
                message: "Person description:",
                default: "Default user",
            },
        ];

        const partialAnswers = await prompt(questions);
        const relationshipDefaults = {
            defaultRelationship: "Consumes",
            defaultRelationshipType: "outgoing",
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
            includeSource: "relationships/_people.dsl",
            includeTabs: "        ",
            relationships: { ...mainRelationship, ...relationships },
        };

        return compiledAnswers;
    },
    actions: [
        {
            skip: (_answers, rootPath) =>
                whenFileExists(
                    "relationships/_people.dsl",
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Relationships/,
            templateFile: "templates/include.hbs",
        } as AppendAction,
        {
            type: "append",
            createIfNotExists: true,
            path: "architecture/systems/_people.dsl",
            templateFile: "templates/system/person.hbs",
        } as AppendAction,
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/relationships/_people.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction,
    ],
};

export default generator;
