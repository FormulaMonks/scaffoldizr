import { dirname } from "node:path";
import chalk from "chalk";

import containerGenerator from "./generators/container.mjs";
import externalSystemGenerator from "./generators/external-system.mjs";
import personGenerator from "./generators/person.mjs";
import variableGenerator from "./generators/variable.mjs";
import viewGenerator from "./generators/view.mjs";
import workspaceGenerator from "./generators/workspace.mjs";
import { removeSpaces } from "./utils/helpers.mjs";
import { getWorkspacePath } from "./utils/workspace.mjs";

// FIXME: Respect uppercase names when transforming to pascalCase

/**
 * @param {import('plop').NodePlopAPI} plop
 * @returns
 */
export default function (plop) {
    plop.setHelper("removeSpaces", removeSpaces);
    plop.setHelper("eq", (arg1, arg2) => arg1 === arg2);
    plop.setWelcomeMessage(
        `
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!`,
    );

    const workspacePath = getWorkspacePath(plop.getDestBasePath());

    if (!workspacePath) {
        console.log(`${chalk.bold(plop.getWelcomeMessage())}
    
${chalk.yellow(
    'It seems the folder you selected does not have a "workspace.dsl" file.',
)}
Base folder: ${chalk.blue(plop.getDestBasePath())}
Let's create a new one by answering the questions below:
`);

        plop.setGenerator("workspace", workspaceGenerator);
        return;
    }

    const workspaceFolder = dirname(workspacePath);

    plop.setGenerator(
        "external system",
        externalSystemGenerator({ workspaceFolder }),
    );
    plop.setGenerator("person", personGenerator({ workspaceFolder }));
    plop.setGenerator("variable", variableGenerator());
    plop.setGenerator("container", containerGenerator({ workspaceFolder }));
    plop.setGenerator("view", viewGenerator({ workspaceFolder }));

    // TODO: Create generator for Structurizr .env-arch
}
