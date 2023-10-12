import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { kebabCase, pascalCase } from "change-case";
import chalk from "chalk";
import { getWorkspaceJson, getWorkspacePath } from "./utils/workspace.mjs";
import { withSystemsQuestion } from "./utils/questions.mjs";
import { removeSpaces } from "./utils/helpers.mjs";
import workspaceGenerator from "./generators/workspace.mjs";

/**
 * @param {import('plop').NodePlopAPI} plop
 * @returns
 */
export default function (plop) {
    plop.setHelper("removeSpaces", removeSpaces);
    plop.setHelper("eq", (arg1, arg2) => arg1 === arg2);
    plop.setWelcomeMessage(
        `
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!`,
    );

    const workspacePath = getWorkspacePath(plop.getDestBasePath());

    if (!workspacePath) {
        console.log(`${chalk.bold(plop.getWelcomeMessage())}
    
${chalk.yellow(
    'It seems the folder you selected does not have a "workspace.dsl" file.',
)}
Base folder: ${chalk.blue(plop.getDestBasePath())}
Let's create a new one by answering the questions below:
`);

        plop.setGenerator("workspace", workspaceGenerator);
        return;
    }

    const workspaceFolder = dirname(workspacePath);

    // TODO: MOVE THESE TO OWN FILES
    plop.setGenerator("external system", {
        description: "Create a new external system",
        prompts: withSystemsQuestion(
            [
                {
                    type: "input",
                    name: "extSystemName",
                    message: "External system name:",
                    validate: (input, answers) => {
                        if (input === answers.systemName) {
                            throw new Error(`Name "${input}" already exists`);
                        }

                        return true;
                    },
                },
                {
                    type: "input",
                    name: "extSystemDescription",
                    message: "System description:",
                    default: "Untitled System",
                },
                {
                    type: "input",
                    name: "relationship",
                    message: "Relationship:",
                    default: "Interacts with",
                },
                {
                    type: "list",
                    name: "relationshipType",
                    message: "Relationship type:",
                    choices: ["outgoing", "incoming"],
                    default: "outgoing",
                },
            ],
            { workspaceFolder },
        ),
        actions: [
            {
                skip: () =>
                    !existsSync(
                        join(workspaceFolder, "/system/external.dsl"),
                    ) &&
                    "Skipping append as system/external.dsl does not exist.",
                type: "append",
                path: "architecture/system/external.dsl",
                templateFile: "templates/system/external.hbs",
            },
            {
                skip: () =>
                    !existsSync(
                        join(workspaceFolder, "/relationships/system.dsl"),
                    ) &&
                    "Skipping append as relationships/system.dsl does not exist.",
                type: "append",
                path: "architecture/relationships/system.dsl",
                templateFile:
                    "templates/relationships/{{relationshipType}}.hbs",
            },
            {
                type: "add",
                skipIfExists: true,
                path: "architecture/system/external.dsl",
                templateFile: "templates/system/external.hbs",
            },
            {
                type: "add",
                skipIfExists: true,
                path: "architecture/relationships/system.dsl",
                templateFile:
                    "templates/relationships/{{relationshipType}}.hbs",
            },
        ],
    });

    plop.setGenerator("person", {
        description: "Create a new person (customer, user, etc)",
        prompts: withSystemsQuestion(
            [
                {
                    type: "input",
                    name: "extSystemName",
                    message: "Person name:",
                    validate: (input, answers) => {
                        if (input === answers.systemName) {
                            throw new Error(`Name "${input}" already exists`);
                        }

                        return true;
                    },
                },
                {
                    type: "input",
                    name: "extSystemDescription",
                    message: "Person description:",
                    default: "Default user",
                },
                {
                    type: "input",
                    name: "relationship",
                    message: "Relationship:",
                    default: "Consumes",
                },
                {
                    type: "list",
                    name: "relationshipType",
                    message: "Relationship type:",
                    choices: ["outgoing", "incoming"],
                    default: "incoming",
                },
            ],
            { workspaceFolder },
        ),
        actions: [
            {
                skip: () =>
                    !existsSync(join(workspaceFolder, "/system/people.dsl")) &&
                    "Skipping append as system/people.dsl does not exist.",
                type: "append",
                path: "architecture/system/people.dsl",
                templateFile: "templates/system/person.hbs",
            },
            {
                skip: () =>
                    !existsSync(
                        join(workspaceFolder, "/relationships/system.dsl"),
                    ) &&
                    "Skipping append as relationships/system.dsl does not exist.",
                type: "append",
                path: "architecture/relationships/system.dsl",
                templateFile:
                    "templates/relationships/{{relationshipType}}.hbs",
            },
            {
                type: "add",
                skipIfExists: true,
                path: "architecture/system/people.dsl",
                templateFile: "templates/system/person.hbs",
            },
            {
                type: "add",
                skipIfExists: true,
                path: "architecture/relationships/system.dsl",
                templateFile:
                    "templates/relationships/{{relationshipType}}.hbs",
            },
        ],
    });

    plop.setGenerator("variable", {
        description: "Create a new workspace variable",
        prompts: [
            {
                type: "input",
                name: "variableName",
                message: "Variable:",
            },
            {
                type: "input",
                name: "variableValue",
                message: "Value:",
                default: "New Value",
            },
        ],
        actions: [
            {
                type: "append",
                path: "architecture/workspace.dsl",
                pattern: /# Constants/,
                templateFile: "templates/constant.hbs",
            },
        ],
    });

    plop.setGenerator("container", {
        description: "Create a new container",
        prompts: async (inquirer) => {
            const { systemName } = await withSystemsQuestion([], {
                workspaceFolder,
            })(inquirer);

            const workspaceInfo = await getWorkspaceJson(workspaceFolder);
            const system = workspaceInfo.model.softwareSystems.find(
                (system) => systemName === system.name,
            );
            const containerNames = system.containers.map(
                (container) => container.name,
            );

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
                    validate: (input, answers) => {
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
                .filter(([name, value]) => value)
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

    // TODO: Other types of views
    // - Container
    // - Component
    // - Dynamic
    // - System
    // // - System landscape
    // // - Deployment

    const skipUnlessViewType = (type) => (answer) =>
        answer.viewType !== type && `[SKIPPED] View type "${type}" selected.`;
    plop.setGenerator("view", {
        description: "Create a new view",
        prompts: withSystemsQuestion(
            [
                {
                    type: "list",
                    name: "viewType",
                    message: "View type:",
                    choices: [
                        // "container",
                        // "component",
                        // "dynamic",
                        "deployment",
                        // "system",
                        "landscape",
                    ],
                },
                {
                    type: "input",
                    name: "viewName",
                    message: "View name:",
                },
                {
                    type: "input",
                    name: "viewDescription",
                    message: "View description:",
                    default: "Untitled view",
                },
            ],
            {
                workspaceFolder,
                questionMessage: "System (to create view for):",
                when: (answers) => answers.viewType !== "landscape",
                position: 1,
            },
        ),
        actions: [
            {
                skip: skipUnlessViewType("deployment"),
                type: "add",
                path: "architecture/views/{{kebabCase viewName}}.dsl",
                templateFile: "templates/views/deployment.hbs",
            },
            {
                skip: skipUnlessViewType("deployment"),
                type: "add",
                path: "architecture/environments/{{kebabCase viewName}}.dsl",
                templateFile: "templates/environments/deployment.hbs",
            },
            {
                when: skipUnlessViewType("landscape"),
                type: "add",
                skipIfExists: true,
                path: "architecture/views/landscape.dsl",
                templateFile: "templates/views/landscape.hbs",
            },
        ],
    });
}
