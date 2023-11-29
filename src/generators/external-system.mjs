import { existsSync } from "node:fs";
import { join } from "node:path";
import { withSystemsQuestion } from "../utils/questions.mjs";

export default ({ workspaceFolder }) => ({
    description: "Create a new external system",
    prompts: withSystemsQuestion(
        [
            {
                type: "input",
                name: "extSystemName",
                message: "External system name:",
                validate: (input, answers) => {
                    if (input === answers.systemName) {
                        throw new Error(`Name "${input}" already exists`);
                    }

                    return true;
                },
            },
            {
                type: "input",
                name: "extSystemDescription",
                message: "System description:",
                default: "Untitled System",
            },
            {
                type: "input",
                name: "relationship",
                message: "Relationship:",
                default: "Interacts with",
            },
            {
                type: "list",
                name: "relationshipType",
                message: "Relationship type:",
                choices: ["outgoing", "incoming"],
                default: "outgoing",
            },
        ],
        { workspaceFolder },
    ),
    actions: [
        {
            skip: () =>
                !existsSync(join(workspaceFolder, "/system/external.dsl")) &&
                "Skipping append as system/external.dsl does not exist.",
            type: "append",
            path: "architecture/system/external.dsl",
            templateFile: "templates/system/external.hbs",
        },
        {
            skip: () =>
                !existsSync(
                    join(workspaceFolder, "/relationships/system.dsl"),
                ) &&
                "Skipping append as relationships/system.dsl does not exist.",
            type: "append",
            path: "architecture/relationships/system.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        },
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/system/external.dsl",
            templateFile: "templates/system/external.hbs",
        },
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/system.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        },
    ],
});
