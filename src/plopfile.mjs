import { execSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { kebabCase } from "change-case";
import chalk from "chalk";

/**
 *
 * @param {import('plop').NodePlopAPI} plop
 * @returns
 */
export default function (plop) {
    plop.setHelper("removeSpaces", (txt) => txt.replace(/\s/g, ""));
    plop.setWelcomeMessage(
        `
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!`,
    );

    const getWorkspacePath = (input) => {
        let workspaceFullPath = resolve(`${input}/workspace.dsl`);
        let isWorkspace = existsSync(workspaceFullPath);

        if (isWorkspace) return workspaceFullPath;

        // Try again with the "architecture" inner path
        workspaceFullPath = resolve(`${input}/architecture/workspace.dsl`);
        isWorkspace = existsSync(workspaceFullPath);

        if (isWorkspace) return workspaceFullPath;

        return null;
    };

    const workspacePath = getWorkspacePath(plop.getDestBasePath());
    const workspaceFolder = dirname(workspacePath);

    const validateSystem = {
        type: "input",
        name: "systemName",
        message: "Base system name:",
        validate: (input, context) => {
            // TODO: Check if this can become a list of systems from workspace.json
            context.systemName = input;
            let systemPath = resolve(
                `${workspaceFolder}/views/${kebabCase(input)}.dsl`,
            );
            let isSystem = existsSync(systemPath);
            if (isSystem) return true;

            throw new Error(
                `System "${systemPath}" does not exist in the workspace`,
            );
        },
    };

    if (!workspacePath) {
        console.log(`${chalk.bold(plop.getWelcomeMessage())}
    
${chalk.yellow(
    'It seems the folder you selected does not have a "workspace.dsl" file.',
)}
Base folder: ${chalk.blue(plop.getDestBasePath())}
Let's create a new one by answering the questions below:
`);

        plop.setGenerator("workspace", {
            description: "Create a new workspace",
            prompts: [
                {
                    type: "input",
                    name: "workspaceName",
                    message: "Workspace name:",
                    validate: (input) => input.length > 0,
                },
                {
                    type: "input",
                    name: "workspaceDescription",
                    message: "Workspace description:",
                    default: "Untitled Workspace",
                },
                {
                    type: "input",
                    name: "systemName",
                    message: "System name:",
                    validate: (input) => input.length > 0,
                },
                {
                    type: "input",
                    name: "systemDescription",
                    message: "System description:",
                    default: "Untitled System",
                },
                {
                    type: "input",
                    name: "authorName",
                    message: "Author Name:",
                    default: execSync("git config --global user.name")
                        .toString()
                        .trim(),
                },
                {
                    type: "input",
                    name: "authorEmail",
                    message: "Author email:",
                    default: execSync("git config --global user.email")
                        .toString()
                        .trim(),
                },
                {
                    type: "confirm",
                    name: "shouldIncludeTheme",
                    message: "Include default theme?",
                    default: true,
                },
            ],
            actions: [
                {
                    type: "add",
                    path: "architecture/workspace.dsl",
                    templateFile: "templates/workspace.hbs",
                },
                {
                    type: "addMany",
                    destination: "architecture",
                    templateFiles: "templates/scripts/**/*.sh",
                    skipIfExists: true,
                },
                {
                    type: "addMany",
                    destination: "architecture",
                    templateFiles: "templates/**/.gitkeep",
                },
                {
                    type: "add",
                    path: "architecture/views/{{kebabCase systemName}}.dsl",
                    templateFile: "templates/views/system.hbs",
                },
            ],
        });

        return;
    }

    plop.setGenerator("external system", {
        description: "Create a new external system",
        prompts: [
            validateSystem,
            {
                type: "input",
                name: "extSystemName",
                message: "External system name:",
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
        prompts: [
            validateSystem,
            {
                type: "input",
                name: "extSystemName",
                message: "Person name:",
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

    // TODO: Other types of views
    // - Container
    // - Component
    // - Dynamic
    // // - Deployment
    plop.setGenerator("view", {
        description: "Create a new view",
        prompts: [
            validateSystem,
            {
                type: "list",
                name: "viewType",
                message: "View type:",
                choices: ["container", "component", "dynamic", "deployment"],
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
        actions: [
            {
                when: (answers) => answers.viewType === "deployment",
                type: "add",
                path: "architecture/views/{{kebabCase viewName}}.dsl",
                templateFile: "templates/views/deployment.hbs",
            },
            {
                when: (answers) => answers.viewType === "deployment",
                type: "add",
                path: "architecture/environments/{{kebabCase viewName}}.dsl",
                templateFile: "templates/environments/deployment.hbs",
            },
        ],
    });

    // TODO: Container generator
    // 1. Check if workspace.json exists
    // 2. Create a list of systems and containers from workspace.json
    // 3. Create a relationship lookup list and create all relationships
    plop.setGenerator("container", {
        description: "Create a new container",
        prompts: async (inquirer) => {},
        actions: async (answers) => {},
    });
}
