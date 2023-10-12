import { execSync } from "node:child_process";

export default {
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
};
