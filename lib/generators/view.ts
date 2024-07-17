import { input, select } from "@inquirer/prompts";
import type { AddAction } from "../utils/actions";
import { skipUnlessViewType, whenViewType } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import { resolveSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedViews,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

// TODO: Other types of views
// - Dynamic
// - Filtered
// // - System landscape
// // - Deployment
const generator: GeneratorDefinition = {
    name: "View",
    description: "Create a new view",
    questions: async (_, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const viewType = await select<string>({
            message: "View type:",
            choices: [
                // "dynamic",
                // "filtered",
                { name: "Deployment", value: "deployment" },
                { name: "Landscape", value: "landscape" },
            ],
        });

        const systemName =
            viewType !== "landscape"
                ? await resolveSystemQuestion(
                      workspaceInfo ?? generator.destPath,
                  )
                : undefined;

        const viewName = await input({
            message: "View name:",
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedViews(workspaceInfo),
            )(),
        });

        const viewDescription = await input({
            message: "View description:",
            default: "Untitled view",
        });

        const instanceDescription =
            viewType === "deployment"
                ? await input({
                      message: "System Instance description:",
                      default: "System instance",
                  })
                : undefined;

        return {
            viewType,
            viewName,
            viewDescription,
            systemName,
            instanceDescription,
        };
    },
    actions: [
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/deployment.hbs",
        } as AddAction,
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/environments/{{kebabCase viewName}}.dsl",
            templateFile: "templates/environments/deployment.hbs",
        } as AddAction,
        {
            when: whenViewType("landscape"),
            type: "add",
            skipIfExists: true,
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/landscape.hbs",
        } as AddAction,
    ],
};

export default generator;
