import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
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

    const validateSystem = {
        type: "input",
        name: "systemName",
        message: "System name:",
        validate: (input, context) => {
            const folder = dirname(workspacePath);
            context.systemName = input;
            let systemPath = resolve(`${folder}/views/${kebabCase(input)}.dsl`);
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

    plop.setGenerator("container", {
        description: "Create a new container",
        prompts: [
            {
                type: "input",
                name: "containerName",
                message: "Container name:",
            },
            {
                type: "input",
                name: "containerDescription",
                message: "Container description:",
                default: "Untitled Container",
            },
        ],
        actions: [],
    });

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
}
