import { $ } from "bun";
import { AddAction, AddManyAction } from "../utils/actions";
import { GeneratorDeclaration } from "../utils/generator";

const globalUserName = await $`git config --global user.name`.text();
const globalUserEmail = await $`git config --global user.email`.text();

type WorkspaceAnswers = {
    workspaceName: string;
    workspaceDescription: string;
    systemName: string;
    systemDescription: string;
    authorName: string;
    authorEmail: string;
    shouldIncludeTheme?: boolean;
};

const workspaceGenerator: GeneratorDeclaration<WorkspaceAnswers> = {
    name: "Workspace",
    description: "Create a new workspace",
    prompts: [
        {
            type: "input",
            name: "workspaceName",
            message: "Workspace name:",
            validate: (input: string) => input.length > 0,
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
            validate: (input: string) => input.length > 0,
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
        // TODO: think how this will do when Open Source
        // {
        //     type: "confirm",
        //     name: "shouldIncludeTheme",
        //     message: "Include default theme?",
        //     default: true,
        // },
    ],
    actions: [
        {
            type: "add",
            path: "architecture/workspace.dsl",
            templateFile: "templates/workspace.hbs",
        } as AddAction,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/scripts/**/*.sh",
            skipIfExists: true,
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

export default workspaceGenerator;
