import { $ } from "bun";
import type { Answers } from "inquirer";
import type { AddAction, AddManyAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { stringEmpty } from "../utils/questions/validators";

const globalUserName = await $`git config --global user.name`.text();
const globalUserEmail = await $`git config --global user.email`.text();

const generator: GeneratorDefinition<Answers> = {
    name: "Workspace",
    description: "Create a new workspace",
    questions: [
        {
            type: "input",
            name: "workspaceName",
            message: "Workspace name:",
            validate: stringEmpty,
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
            validate: stringEmpty,
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
            default: globalUserName.trim(),
        },
        {
            type: "input",
            name: "authorEmail",
            message: "Author email:",
            default: globalUserEmail.trim(),
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
        } as AddAction,
        {
            type: "add",
            path: "architecture/systems/_system.dsl",
            templateFile: "templates/system/system.hbs",
        } as AddAction,
        {
            type: "add",
            path: "architecture/containers/{{kebabCase systemName}}/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction,
        {
            type: "add",
            path: "architecture/relationships/_system.dsl",
            templateFile: "templates/empty.hbs",
        } as AddAction,
        {
            type: "add",
            path: "architecture/.gitignore",
            templateFile: "templates/.gitignore",
        } as AddAction,
        {
            type: "add",
            path: "architecture/.env-arch",
            templateFile: "templates/.env-arch",
        } as AddAction,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/scripts/**/*.sh",
            skipIfExists: true,
            filePermissions: "744",
        } as AddManyAction,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/**/.gitkeep",
        } as AddManyAction,
        {
            type: "add",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            templateFile: "templates/views/system.hbs",
        } as AddAction,
        // TODO: Add ".structurizr" path to gitignore file
    ],
};

export default generator;
