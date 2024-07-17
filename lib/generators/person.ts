import { Separator, input } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import { whenFileExists } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import {
    addRelationshipsToElement,
    defaultParser,
    resolveRelationshipForElement,
} from "../utils/questions/relationships";
import { getSystemQuestionAsPromise } from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (_, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemName = await getSystemQuestionAsPromise(
            workspaceInfo ?? generator.destPath,
        );

        const elementName = await input({
            message: "Person name:",
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedElements(workspaceInfo),
            ),
        });

        const personDescription = await input({
            message: "Person description:",
            default: "Default user",
        });

        const relationshipWithSystem = await resolveRelationshipForElement(
            systemName,
            elementName,
            {
                defaultRelationship: "Consumes",
                defaultRelationshipType: "outgoing",
            },
        );

        const mainRelationship = defaultParser(relationshipWithSystem);
        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                filterChoices: (elm) =>
                    elm instanceof Separator || elm.value !== systemName,
                defaultRelationship: "Interacts with",
                defaultRelationshipType: "outgoing",
            },
        );

        const compiledAnswers = {
            systemName,
            personDescription,
            elementName,
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
