import { input, select } from "@inquirer/prompts";
import type { AddAction } from "../utils/actions";
import type { GeneratorDefinition, QuestionsObject } from "../utils/generator";
import { stringEmpty } from "../utils/questions/validators";

type ArchetypeAnswers = {
    name: string;
    baseType: string;
    technology: string;
    tags: string;
};

const generator: GeneratorDefinition<ArchetypeAnswers> = {
    name: "Archetype",
    description: "Create a new archetype",
    questions: {
        name: () =>
            input({
                message: "Archetype name:",
                required: true,
                validate: stringEmpty,
            }),
        baseType: () =>
            select({
                message: "Base type:",
                choices: [
                    { name: "Container", value: "container" },
                    { name: "Component", value: "component" },
                    { name: "Software System", value: "softwareSystem" },
                    { name: "Relationship (->)", value: "->" },
                ],
            }),
        technology: () =>
            input({
                message: "Technology (optional):",
            }),
        tags: () =>
            input({
                message: "Tags (optional):",
            }),
    } as QuestionsObject,
    actions: [
        {
            type: "add",
            path: "architecture/archetypes/{{kebabCase name}}.dsl",
            templateFile: "templates/archetypes/archetype.hbs",
        } as AddAction<ArchetypeAnswers>,
    ],
};

export default generator;
