import { resolve } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import workspaceGenerator from "./generators/workspace";
import templates from "./templates/bundle";
import { createGenerator } from "./utils/generator";
import { getWorkspacePath } from "./utils/workspace";

const args = await yargs(hideBin(process.argv))
    .option("dest", {
        default: ".",
        desc: "Target architecture folder.",
    })
    .parse();

console.log(
    chalk.bold(`
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!
    `),
);

const prompt = inquirer.createPromptModule();
const defaultPath = resolve(process.cwd(), args.dest);
const workspacePath = getWorkspacePath(defaultPath);

if (!workspacePath) {
    console.log(`${chalk.yellow(
        'It seems the folder you selected does not have a "workspace.dsl" file.',
    )}
Base folder: ${chalk.blue(defaultPath)}
Let's create a new one by answering the questions below.
`);
    try {
        await createGenerator(prompt, {
            ...workspaceGenerator,
            templates,
            workspacePath: workspacePath ?? defaultPath,
        });
        process.exit(0);
    } catch (err) {
        console.log(err);
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}
