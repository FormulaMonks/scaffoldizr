import type { QuestionCollection } from "inquirer";
import type { AddAction, AppendAction } from "../utils/actions";
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
    validateDuplicateElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type PersonAnswers = {
    systemName: string;
    elementName: string;
    personDescription: string;
    relationship: string;
    relationshipType: "outgoing" | "incoming";
};

const generator: GeneratorDefinition<PersonAnswers> = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const questions: QuestionCollection<PersonAnswers> = [
            await getSystemQuestion(workspaceInfo ?? generator.destPath),
            {
                type: "input",
                name: "elementName",
                message: "Person name:",
                validate: chainValidators(
                    stringEmpty,
                    validateDuplicateElements(workspaceInfo),
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
                filterChoices: (elm) => elm.value !== partialAnswers.systemName,
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            ...partialAnswers,
            source: "relationships/_people.dsl",
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
            when: (_answers, rootPath) =>
                whenFileExists(
                    "relationships/_people.dsl",
                    getWorkspacePath(rootPath),
                ),
            type: "append",
            path: "architecture/relationships/_people.dsl",
            templateFile: "templates/relationships/multiple.hbs",
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
            path: "architecture/relationships/_people.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AddAction,
    ],
};

export default generator;
