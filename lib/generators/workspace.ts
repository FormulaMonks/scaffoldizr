import { confirm, input } from "@inquirer/prompts";
import { $ } from "bun";
import type { AddAction, AddManyAction } from "../utils/actions";
import type { GeneratorDefinition, QuestionsObject } from "../utils/generator";
import { stringEmpty } from "../utils/questions/validators";

const globalUserName =
    await $`git config --global user.name || echo "(no name)"`.text();
const globalUserEmail =
    await $`git config --global user.email || echo "(no email)"`.text();

type WorkspaceAnswers = {
    workspaceName: string;
    workspaceDescription: string;
    systemName: string;
    systemDescription: string;
    authorName: string;
    authorEmail: string;
    shouldIncludeTheme: boolean;
};

const generator: GeneratorDefinition<WorkspaceAnswers> = {
    name: "Workspace",
    description: "Create a new workspace",
    questions: {
        workspaceName: () =>
            input({
                message: "Workspace name:",
                required: true,
                validate: stringEmpty,
            }),
        workspaceDescription: () =>
            input({
                message: "Workspace description:",
                default: "Untitled Workspace",
            }),
        systemName: () =>
            input({
                message: "System name:",
                required: true,
                validate: stringEmpty,
            }),
        systemDescription: () =>
            input({
                message: "System description:",
                default: "Untitled System",
            }),
        authorName: () =>
            input({
                message: "Author Name:",
                default: globalUserName.trim(),
            }),
        authorEmail: () =>
            input({
                message: "Author email:",
                default: globalUserEmail.trim(),
            }),
        shouldIncludeTheme: () =>
            confirm({
                message: "Include default theme?",
                default: true,
            }),
    } as QuestionsObject,
    actions: [
        {
            type: "add",
            path: "architecture/workspace.dsl",
            templateFile: "templates/workspace.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/systems/_system.dsl",
            templateFile: "templates/system/system.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/containers/{{kebabCase systemName}}/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/relationships/_system.dsl",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/.gitignore",
            templateFile: "templates/.gitignore",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/.env-arch",
            templateFile: "templates/.env-arch",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/scripts/**/*.sh",
            skipIfExists: true,
            filePermissions: "744",
        } as AddManyAction<WorkspaceAnswers>,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/**/.gitkeep",
        } as AddManyAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            templateFile: "templates/views/system.hbs",
        } as AddAction<WorkspaceAnswers>,
    ],
};

export default generator;
