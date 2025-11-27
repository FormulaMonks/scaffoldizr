import { input } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
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

type PersonAnswers = {
    personDescription: string;
    elementName: string;
    includeSource: string;
    includeTabs: string;
    relationships: Record<string, Relationship>;
    workspaceScope?: string;
};

const generator: GeneratorDefinition<PersonAnswers> = {
    name: Elements.Person,
    description: "Create a new person (customer, user, etc)",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
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

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                workspacePath: getWorkspacePath(generator.destPath),
                defaultRelationship: "Consumes",
                defaultRelationshipType: "outgoing",
            },
        );

        const compiledAnswers = {
            workspaceScope: workspaceInfo?.configuration.scope,
            personDescription,
            elementName,
            includeSource: "relationships/_people.dsl",
            includeTabs: "        ",
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
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
