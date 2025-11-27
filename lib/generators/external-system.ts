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

type ExternalSystemAnswers = {
    elementName: string;
    extSystemDescription: string;
    includeSource: string;
    includeTabs: string;
    relationships: Record<string, Relationship>;
};

const generator: GeneratorDefinition<ExternalSystemAnswers> = {
    name: Elements.ExternalSystem,
    description: "Create a new external system",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const elementName = await input({
            message: "External system name:",
            required: true,
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedElements(workspaceInfo),
            )(),
        });

        const extSystemDescription = await input({
            message: "System description:",
            default: "Untitled System",
        });

        const relationshipDefaults = {
            defaultRelationship: "Interacts with",
            defaultRelationshipType: "incoming",
        };

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                workspacePath: getWorkspacePath(generator.destPath),
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            elementName,
            extSystemDescription,
            includeSource: "relationships/_external.dsl",
            includeTabs: "        ",
            relationships,
        };

        return compiledAnswers;
    },
    actions: [
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/systems/_external.dsl",
            templateFile: "templates/system/external.hbs",
        } as AppendAction<ExternalSystemAnswers>,
        {
            createIfNotExists: true,
            type: "append",
            path: "architecture/relationships/_external.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        } as AppendAction<ExternalSystemAnswers>,
    ],
};

export default generator;
