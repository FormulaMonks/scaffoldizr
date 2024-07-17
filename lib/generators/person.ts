import { Separator, input } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import { whenFileExists } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import {
    type Relationship,
    addRelationshipsToElement,
    defaultParser,
    resolveRelationshipForElement,
} from "../utils/questions/relationships";
import { resolveSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type PersonAnswers = {
    systemName: string;
    personDescription: string;
    elementName: string;
    includeSource: string;
    includeTabs: string;
    relationships: Record<string, Relationship>;
};

const generator: GeneratorDefinition<PersonAnswers> = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemName = await resolveSystemQuestion(
            workspaceInfo ?? generator.destPath,
        );

        const elementName = await input({
            message: "Person name:",
            required: true,
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedElements(workspaceInfo),
            )(),
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
        } as AppendAction<PersonAnswers>,
        {
            type: "append",
            createIfNotExists: true,
            path: "architecture/systems/_people.dsl",
            templateFile: "templates/system/person.hbs",
        } as AppendAction<PersonAnswers>,
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/relationships/_people.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<PersonAnswers>,
    ],
};

export default generator;
