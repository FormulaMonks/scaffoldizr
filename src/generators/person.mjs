import { existsSync } from "node:fs";
import { join } from "node:path";
import { withSystemsQuestion } from "../utils/questions.mjs";

export default ({ workspaceFolder }) => ({
    description: "Create a new person (customer, user, etc)",
    prompts: withSystemsQuestion(
        [
            {
                type: "input",
                name: "extSystemName",
                message: "Person name:",
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
                message: "Person description:",
                default: "Default user",
            },
            {
                type: "input",
                name: "relationship",
                message: "Relationship:",
                default: "Consumes",
            },
            {
                type: "list",
                name: "relationshipType",
                message: "Relationship type:",
                choices: ["outgoing", "incoming"],
                default: "incoming",
            },
        ],
        { workspaceFolder },
    ),
    actions: [
        {
            skip: () =>
                !existsSync(join(workspaceFolder, "/system/people.dsl")) &&
                "Skipping append as system/people.dsl does not exist.",
            type: "append",
            path: "architecture/system/people.dsl",
            templateFile: "templates/system/person.hbs",
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
            path: "architecture/system/people.dsl",
            templateFile: "templates/system/person.hbs",
        },
        {
            type: "add",
            skipIfExists: true,
            path: "architecture/relationships/system.dsl",
            templateFile: "templates/relationships/{{relationshipType}}.hbs",
        },
    ],
});
