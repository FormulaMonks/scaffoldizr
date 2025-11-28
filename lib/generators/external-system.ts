import { input, Separator, select } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { resolveAvailableArchetypeElements } from "../utils/questions/archetypes";
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
    archetype?: string;
};

const generator: GeneratorDefinition<ExternalSystemAnswers> = {
    name: Elements.ExternalSystem,
    description: "Create a new external system",
    questions: async (generator) => {
        const workspacePath = getWorkspacePath(generator.destPath);
        const workspaceInfo = await getWorkspaceJson(workspacePath);

        const elementName = await input({
            message: "External system name:",
            required: true,
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedElements(workspaceInfo),
            )(),
        });

        const availableSoftwareSystemArchetypes = workspacePath
            ? await resolveAvailableArchetypeElements(
                  workspacePath,
                  Elements.System,
              )
            : undefined;

        const archetype = availableSoftwareSystemArchetypes?.length
            ? await select<string | "custom">({
                  message: `Archetype system for ${elementName}:`,
                  choices: [
                      ...availableSoftwareSystemArchetypes.map((archetype) => ({
                          name: archetype.name.split("_")[1],
                          value: archetype.name.split("_")[1],
                      })),
                      new Separator(),
                      {
                          name: "Custom",
                          value: "custom",
                      },
                  ],
              })
            : "custom";

        const extSystemDescription =
            archetype === "custom"
                ? await input({
                      message: "System description:",
                      default: "Untitled System",
                  })
                : "";

        const relationshipDefaults = {
            defaultRelationship: "Interacts with",
            defaultRelationshipType: "incoming",
        };

        const relationships = await addRelationshipsToElement(
            elementName,
            workspaceInfo,
            {
                workspacePath,
                ...relationshipDefaults,
            },
        );

        const compiledAnswers = {
            elementName,
            extSystemDescription,
            includeSource: "relationships/_external.dsl",
            includeTabs: "        ",
            archetype: archetype === "custom" ? undefined : archetype,
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
