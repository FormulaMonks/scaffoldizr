import { relative, resolve } from "node:path";
import chalk from "chalk";
import inquirer, { Answers } from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import {
    constantGenerator,
    extSystemGenerator,
    personGenerator,
    viewGenerator,
    workspaceGenerator,
} from "./generators";
import templates from "./templates/bundle";
import {
    Generator,
    GeneratorDefinition,
    GetAnswers,
    createGenerator,
} from "./utils/generator";
import { getWorkspacePath } from "./utils/workspace";

const args = await yargs(hideBin(process.argv))
    .version("version", "Show current tool version", pkg.version)
    .usage("Blueprint DSL: Create a Structurizr DSL scaffolding in seconds!")
    .option("dest", {
        default: ".",
        desc: "Target architecture folder",
    }).argv;

console.log(
    chalk.bold(`
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!
    `),
);

const prompt = inquirer.createPromptModule();
const destPath = resolve(process.cwd(), args.dest);
const workspacePath = getWorkspacePath(destPath);

if (!workspacePath) {
    console.log(`${chalk.yellow(
        'It seems the folder you selected does not have a "workspace.dsl" file.',
    )}
Destination folder: ${chalk.blue(relative(process.cwd(), destPath))}
Let's create a new one by answering the questions below.
`);
    try {
        const generator: Generator<GetAnswers<typeof workspaceGenerator>> = {
            ...workspaceGenerator,
            templates,
            destPath,
        };

        await createGenerator(prompt, generator);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

console.log(
    `Architecture folder: ${chalk.blue(
        relative(process.cwd(), workspacePath),
    )}\n`,
);

const mainPrompt = inquirer.createPromptModule();
const generate = await mainPrompt<{ element: GeneratorDefinition<Answers> }>([
    {
        name: "element",
        message: "Create a new element:",
        type: "list",
        choices: [
            constantGenerator,
            personGenerator,
            extSystemGenerator,
            viewGenerator,
        ].map((g) => ({
            name: g.name,
            value: g,
        })),
    },
]);

try {
    const generator: Generator<GetAnswers<typeof generate.element>> = {
        ...generate.element,
        templates,
        destPath,
    };

    await createGenerator(prompt, generator);
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}
