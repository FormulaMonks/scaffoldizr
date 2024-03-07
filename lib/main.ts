import { relative, resolve } from "node:path";
import chalk from "chalk";
import { capitalCase } from "change-case";
import inquirer, { Answers } from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import * as generators from "./generators";
import templates from "./templates/bundle";
import {
    Generator,
    GeneratorDefinition,
    GetAnswers,
    createGenerator,
} from "./utils/generator";
import { labelElementByName } from "./utils/labels";
import { getWorkspacePath } from "./utils/workspace";

const args = await yargs(hideBin(process.argv))
    .version("version", "Show current tool version", pkg.version)
    .usage(
        `${capitalCase(
            pkg.name,
        )}: Create a Structurizr DSL scaffolding in seconds!`,
    )
    .option("dest", {
        default: ".",
        desc: "Target architecture folder",
    }).argv;

console.log(
    chalk.bold(`
Welcome to ${chalk.cyan(capitalCase(pkg.name))}
Create a Structurizr DSL scaffolding in seconds!
    `),
);

const prompt = inquirer.createPromptModule();
const destPath = resolve(process.cwd(), args.dest);
const workspacePath = getWorkspacePath(destPath);

const { workspaceGenerator, ...otherGenerators } = generators;

if (!workspacePath) {
    console.log(`${chalk.yellow(
        'It seems the folder you selected does not have a "workspace.dsl" file.',
    )}
Destination folder: ${chalk.blue(
        relative(process.cwd(), destPath) || process.cwd(),
    )}
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
        choices: Object.values(otherGenerators)
            .map((g) => ({
                name: `${labelElementByName(g.name)} ${g.name}`,
                value: g,
            }))
            .toReversed()
            .toSorted(),
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
