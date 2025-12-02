import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { $ } from "bun";
import type { AddAction, AddManyAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { stringEmpty } from "../utils/questions/validators";

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
};

const generator: GeneratorDefinition<WorkspaceAnswers> = {
    name: Elements.Workspace,
    description: "Create a new workspace",
    questions: async () => {
        const workspaceName = await input({
            message: "Workspace name:",
            required: true,
            validate: stringEmpty,
        });

        const workspaceDescription = await input({
            message: "Workspace description:",
            default: "Untitled Workspace",
        });

        const workspaceScope = await select({
            message: "Workspace scope:",
            choices: [
                { name: "Software System", value: "softwaresystem" },
                { name: "Landscape", value: "landscape" },
            ],
        });

        const systemName =
            workspaceScope === "softwaresystem"
                ? await input({
                      message: "System name:",
                      required: true,
                      validate: stringEmpty,
                  })
                : undefined;

        const systemDescription =
            workspaceScope === "softwaresystem"
                ? await input({
                      message: "System description:",
                      default: "Untitled System",
                  })
                : undefined;

        const authorName = await input({
            message: "Author Name:",
            default: globalUserName.trim(),
        });

        const authorEmail = await input({
            message: "Author email:",
            default: globalUserEmail.trim(),
        });

        const shouldIncludeTheme = await confirm({
            message: "Include default theme?",
            default: true,
        });

        const additionalThemes = shouldIncludeTheme
            ? await checkbox({
                  message: "Select additional themes to include:",
                  choices: [
                      {
                          name: "Shapes (Scaffoldizr)",
                          value: "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json",
                      },
                      {
                          name: "Status (Scaffoldizr)",
                          value: "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-status.json",
                      },
                  ],
              })
            : [];

        const mainColor = shouldIncludeTheme
            ? await select({
                  message: "Main color for elements?",
                  choices: [
                      { name: "Blue (Default)", value: undefined },
                      {
                          name: "Red",
                          value: "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-red.json",
                      },
                      {
                          name: "Green",
                          value: "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-green.json",
                      },
                      {
                          name: "Yellow",
                          value: "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-yellow.json",
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
            additionalThemes: [...additionalThemes, mainColor].filter(
                Boolean,
            ) as string[],
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
