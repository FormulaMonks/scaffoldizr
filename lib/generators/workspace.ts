import { $ } from "bun";
import pkg from "../../package.json";
import type { AddAction, AddManyAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { checkbox, confirm, input, select } from "../utils/prompts";
import { stringEmpty } from "../utils/questions/validators";
import {
    SCAFFOLDIZR_GREEN_THEME_URL,
    SCAFFOLDIZR_RED_THEME_URL,
    SCAFFOLDIZR_SHAPES_THEME_URL,
    SCAFFOLDIZR_STATUS_THEME_URL,
    SCAFFOLDIZR_YELLOW_THEME_URL,
    STRUCTURIZR_DEFAULT_THEME_URL,
} from "../utils/themes";

const globalUserName =
    await $`git config --global user.name || echo "(no name)"`.text();
const globalUserEmail =
    await $`git config --global user.email || echo "(no email)"`.text();

type WorkspaceAnswers = {
    workspaceName: string;
    workspaceDescription: string;
    workspaceScope: string;
    systemName?: string;
    systemDescription?: string;
    authorName: string;
    authorEmail: string;
    shouldIncludeTheme: boolean;
    additionalThemes?: string[];
    scaffoldizrVersion: string;
};

const generator: GeneratorDefinition<WorkspaceAnswers> = {
    name: Elements.Workspace,
    description: "Create a new workspace",
    questions: async () => {
        const workspaceName = await input({
            name: "workspaceName",
            message: "Workspace name:",
            required: true,
            validate: stringEmpty,
        });

        const workspaceDescription = await input({
            name: "workspaceDescription",
            message: "Workspace description:",
            default: "Untitled Workspace",
        });

        const workspaceScope = await select({
            name: "workspaceScope",
            message: "Workspace scope:",
            choices: [
                { name: "Software System", value: "softwaresystem" },
                { name: "Landscape", value: "landscape" },
            ],
        });

        const systemName =
            workspaceScope === "softwaresystem"
                ? await input({
                      name: "systemName",
                      message: "System name:",
                      required: true,
                      validate: stringEmpty,
                  })
                : undefined;

        const systemDescription =
            workspaceScope === "softwaresystem"
                ? await input({
                      name: "systemDescription",
                      message: "System description:",
                      default: "Untitled System",
                  })
                : undefined;

        const authorName = await input({
            name: "authorName",
            message: "Author Name:",
            default: globalUserName.trim(),
        });

        const authorEmail = await input({
            name: "authorEmail",
            message: "Author email:",
            default: globalUserEmail.trim(),
        });

        const shouldIncludeTheme = await confirm({
            name: "shouldIncludeTheme",
            message: "Include default theme?",
            default: true,
        });

        const additionalThemes = shouldIncludeTheme
            ? await checkbox({
                  name: "additionalThemes",
                  message: "Select additional themes to include:",
                  choices: [
                      {
                          name: "Shapes (Scaffoldizr)",
                          value: SCAFFOLDIZR_SHAPES_THEME_URL,
                      },
                      {
                          name: "Status (Scaffoldizr)",
                          value: SCAFFOLDIZR_STATUS_THEME_URL,
                      },
                  ],
              })
            : [];

        const mainColor = shouldIncludeTheme
            ? await select({
                  name: "mainColor",
                  message: "Main color for elements?",
                  choices: [
                      { name: "Blue (Default)", value: undefined },
                      {
                          name: "Red",
                          value: SCAFFOLDIZR_RED_THEME_URL,
                      },
                      {
                          name: "Green",
                          value: SCAFFOLDIZR_GREEN_THEME_URL,
                      },
                      {
                          name: "Yellow",
                          value: SCAFFOLDIZR_YELLOW_THEME_URL,
                      },
                  ],
              })
            : undefined;

        return {
            workspaceName,
            workspaceDescription,
            workspaceScope,
            systemName,
            systemDescription,
            authorName,
            authorEmail,
            shouldIncludeTheme,
            additionalThemes: [
                STRUCTURIZR_DEFAULT_THEME_URL,
                ...additionalThemes,
                mainColor,
            ].filter(Boolean) as string[],
            scaffoldizrVersion: pkg.version,
        };
    },
    actions: [
        {
            type: "add",
            path: "architecture/workspace.dsl",
            templateFile: "templates/workspace.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/archetypes/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            when: (answers) =>
                Boolean(answers.systemName && answers.systemDescription),
            type: "add",
            path: "architecture/systems/_system.dsl",
            templateFile: "templates/system/system.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            skip: (answers) =>
                Boolean(answers.systemName && answers.systemDescription),
            type: "add",
            path: "architecture/systems/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            when: (answers) =>
                Boolean(answers.systemName && answers.systemDescription),
            type: "add",
            path: "architecture/containers/{{kebabCase systemName}}/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            type: "add",
            path: "architecture/relationships/.gitkeep",
            templateFile: "templates/empty.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            when: (answers) =>
                Boolean(answers.systemName && answers.systemDescription),
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
            path: "architecture/.gitattributes",
            templateFile: "templates/.gitattributes",
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
            templateFiles: "templates/scripts/**/*.ps1",
            skipIfExists: true,
        } as AddManyAction<WorkspaceAnswers>,
        {
            type: "addMany",
            destination: "architecture",
            templateFiles: "templates/**/.gitkeep",
        } as AddManyAction<WorkspaceAnswers>,
        {
            when: (answers) =>
                Boolean(answers.workspaceScope === "softwaresystem"),
            type: "add",
            path: "architecture/views/{{kebabCase systemName}}.dsl",
            templateFile: "templates/views/system.hbs",
        } as AddAction<WorkspaceAnswers>,
        {
            when: (answers) => Boolean(answers.workspaceScope === "landscape"),
            type: "add",
            skipIfExists: true,
            path: "architecture/views/{{kebabCase workspaceName}}.dsl",
            templateFile: "templates/views/landscape.hbs",
        } as AddAction<WorkspaceAnswers>,
    ],
};

export default generator;
