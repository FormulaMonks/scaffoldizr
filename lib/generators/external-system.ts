import { Separator, input } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import { whenFileExists } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import {
    addRelationshipsToElement,
    defaultParser,
    resolveRelationshipForElement,
} from "../utils/questions/relationships";
import { resolveSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    duplicatedSystemName,
    stringEmpty,
    validateDuplicatedElements,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

const generator: GeneratorDefinition = {
    name: "External System",
    description: "Create a new external system",
    questions: async (_, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const systemName = await resolveSystemQuestion(
            workspaceInfo ?? generator.destPath,
        );

        const elementName = await input({
            message: "External system name:",
            required: true,
            validate: chainValidators(
                stringEmpty,
                duplicatedSystemName,
                validateDuplicatedElements(workspaceInfo),
            )({ systemName }),
        });

        const extSystemDescription = await input({
            message: "System description:",
            default: "Untitled System",
        });

        const relationshipDefaults = {
            defaultRelationship: "Interacts with",
            defaultRelationshipType: "incoming",
        };

        const relationshipWithSystem = await resolveRelationshipForElement(
            systemName,
            elementName,
            relationshipDefaults,
        );

        const mainRelationship = defaultParser(relationshipWithSystem);
        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                filterChoices: (elm) =>
                    elm instanceof Separator || elm.value !== systemName,
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            systemName,
            elementName,
            extSystemDescription,
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
