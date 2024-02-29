import type { QuestionCollection } from "inquirer";
import type { AddAction } from "../utils/actions";
import { skipUnlessViewType, whenViewType } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import { getSystemQuestion } from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedViews,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

type ViewAnswers = {
    viewType: string;
    viewName: string;
    viewDescription: string;
};

// TODO: Other types of views
// - Container
// - Component
// - Dynamic
// - System
// // - System landscape
// // - Deployment
const generator: GeneratorDefinition<ViewAnswers> = {
    name: "View",
    description: "Create a new view",
    questions: async (prompt, generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const questions: QuestionCollection<ViewAnswers> = [
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
            await getSystemQuestion(workspaceInfo ?? generator.destPath, {
                message: "System (to create view for):",
                when: (answers) => answers.viewType !== "landscape",
            }),
            {
                type: "input",
                name: "viewName",
                message: "View name:",
                validate: chainValidators(
                    stringEmpty,
                    validateDuplicatedViews(workspaceInfo),
                ),
            },
            {
                type: "input",
                name: "viewDescription",
                message: "View description:",
                default: "Untitled view",
            },
        ];
        return prompt(questions);
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
