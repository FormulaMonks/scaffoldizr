import { withSystemsQuestion } from "../utils/questions.mjs";

const skipUnlessViewType = (type) => (answer) =>
    answer.viewType !== type && `[SKIPPED] View type "${type}" selected.`;

// TODO: Other types of views
// - Container
// - Component
// - Dynamic
// - System
// // - System landscape
// // - Deployment
export default ({ workspaceFolder }) => ({
    description: "Create a new view",
    prompts: withSystemsQuestion(
        [
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
        {
            workspaceFolder,
            questionMessage: "System (to create view for):",
            when: (answers) => answers.viewType !== "landscape",
            position: 1,
        },
    ),
    actions: [
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/deployment.hbs",
        },
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/environments/{{kebabCase viewName}}.dsl",
            templateFile: "templates/environments/deployment.hbs",
        },
        {
            when: skipUnlessViewType("landscape"),
            type: "add",
            skipIfExists: true,
            path: "architecture/views/landscape.dsl",
            templateFile: "templates/views/landscape.hbs",
        },
    ],
});
