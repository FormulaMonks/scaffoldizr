import { readFileSync } from "node:fs";
import { join } from "node:path";
import { kebabCase, pascalCase } from "change-case";
import { removeSpaces } from "../utils/helpers.mjs";
import { withSystemsQuestion } from "../utils/questions.mjs";
import { getWorkspaceJson } from "../utils/workspace.mjs";

export default ({ workspaceFolder }) => ({
    description: "Create a new container",
    prompts: async (inquirer) => {
        const { systemName } = await withSystemsQuestion([], {
            workspaceFolder,
        })(inquirer);

        const workspaceInfo = await getWorkspaceJson(workspaceFolder);
        const system = workspaceInfo.model.softwareSystems.find(
            (system) => systemName === system.name,
        );
        const containerNames = (system.containers ?? []).map(
            (container) => container.name,
        );

        // TODO: Reuse this logic to create relationships with systems and containers
        const relationships = containerNames.flatMap((containerName) => {
            const containerNamePascalCase = pascalCase(
                removeSpaces(containerName),
            );
            return [
                {
                    type: "confirm",
                    name: `${containerNamePascalCase}_relates`,
                    message: `Relates to "${containerName}":`,
                    default: false,
                },
                {
                    type: "input",
                    name: `${containerNamePascalCase}_relationship`,
                    when: (answers) =>
                        answers[`${containerNamePascalCase}_relates`],
                    message: "Relationship:",
                    default: "Consumes",
                },
                {
                    type: "list",
                    name: `${containerNamePascalCase}_relationshipType`,
                    when: (answers) =>
                        answers[`${containerNamePascalCase}_relates`],
                    message: "Relationship type:",
                    choices: ["outgoing", "incoming"],
                    default: "incoming",
                },
            ];
        });

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "containerName",
                message: "Container name:",
                validate: (input) => {
                    if (
                        input === systemName ||
                        containerNames.includes(input)
                    ) {
                        throw new Error(`Name "${input}" already exists`);
                    }

                    return true;
                },
            },
            {
                type: "input",
                name: "containerDescription",
                message: "Container description:",
                default: "Untitled container",
            },
            {
                type: "list",
                name: "containerType",
                message: "Container type:",
                choices: [
                    "EventBus",
                    "MessageBroker",
                    "Function",
                    "Database",
                    "WebApp",
                    "MobileApp",
                    "None of the above",
                ],
            },
            {
                type: "input",
                name: "containerTechnology",
                message: "Container technology:",
            },
        ]);

        const relationshipAnswers = await inquirer.prompt(relationships);
        const parsedRelationships = Object.entries(relationshipAnswers)
            .filter(([, value]) => value)
            .reduce((result, next) => {
                const [containerName, value] = next[0].split("_");
                result[containerName] = result[containerName] ?? {};
                result[containerName][value] = next[1];

                return result;
            }, {});

        return {
            systemName,
            ...answers,
            relationships: parsedRelationships,
        };
    },
    actions: [
        {
            type: "add",
            path: "architecture/containers/{{kebabCase containerName}}.dsl",
            skipIfExists: true,
            templateFile: "templates/containers/container.hbs",
        },
        {
            type: "append",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            skip: (answers) => {
                const systemView = readFileSync(
                    join(
                        workspaceFolder,
                        `views/${kebabCase(answers.systemName)}.dsl`,
                    ),
                );

                const match = new RegExp(
                    `container ${pascalCase(answers.systemName)}`,
                    "g",
                ).test(systemView.toString());

                return match && "Skipped: Container view already exists.";
            },
            templateFile: "templates/views/container.hbs",
        },
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/{{kebabCase containerName}}.dsl",
            templateFile: "templates/relationships/multiple.hbs",
        },
    ],
});
