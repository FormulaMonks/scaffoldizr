import { input, select } from "@inquirer/prompts";
import type { AddAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { resolveBaseElementQuestion } from "../utils/questions/archetypes";
import { stringEmpty } from "../utils/questions/validators";

type ArchetypeAnswers = {
    name: string;
    baseElement: string;
    archetype?: string;
    position: number;
    technology?: string;
    description?: string;
    tags: string;
};

const generator: GeneratorDefinition<ArchetypeAnswers> = {
    name: Elements.Archetype,
    description: "Create a new archetype",
    questions: async (generator) => {
        const {
            element: baseElement,
            archetype,
            position,
        } = await resolveBaseElementQuestion(generator.destPath);

        const name = await input({
            message: "Archetype name:",
            required: true,
            validate: stringEmpty,
        });

        const description = await input({
            message: "Description (optional):",
        });

        const containerType =
            baseElement === "container"
                ? await select({
                      message: "Container type:",
                      default: "None of the above",
                      choices: [
                          { name: "EventBus", value: "EventBus" },
                          { name: "MessageBroker", value: "MessageBroker" },
                          { name: "Function", value: "Function" },
                          { name: "Database", value: "Database" },
                          { name: "WebApp", value: "WebApp" },
                          { name: "MobileApp", value: "MobileApp" },
                          {
                              name: "None of the above",
                              value: "",
                          },
                      ],
                  })
                : undefined;

        const technology =
            baseElement !== "system"
                ? await input({
                      message: "Technology (optional):",
                  })
                : undefined;

        const tags = await input({
            message: "Tags (optional):",
        });

        return {
            name,
            baseElement,
            archetype,
            position,
            description,
            technology,
            tags: tags
                .trim()
                .split(",")
                .concat([containerType ?? ""])
                .map((tag) => tag.trim())
                .filter(Boolean)
                .join(","),
        };
    },
    actions: [
        {
            type: "add",
            path: "architecture/archetypes/{{position}}_{{camelCase (removeSpaces name)}}_{{baseElement}}.dsl",
            templateFile: "templates/archetypes/archetype.hbs",
        } as AddAction<ArchetypeAnswers>,
    ],
};

export default generator;
