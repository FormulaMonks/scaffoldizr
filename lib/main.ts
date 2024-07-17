import { relative, resolve } from "node:path";
import { $ } from "bun";
import chalk from "chalk";
import { capitalCase } from "change-case";
import inquirer from "inquirer";
import type { Answers } from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import * as generators from "./generators";
import templates from "./templates/bundle";
import type {
    Generator,
    GeneratorDefinition,
    GetAnswers,
} from "./utils/generator";
import { createGenerator } from "./utils/generator";
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
    })
    .option("export", {
        alias: "e",
        type: "boolean",
        default: false,
        desc: "Use structurizr-cli to export the workspace to JSON",
    }).argv;

console.log(
    chalk.bold(`
Welcome to ${chalk.cyan(capitalCase(pkg.name))}
Create a Structurizr DSL scaffolding in seconds!
    `),
);

// TODO: Remove
const prompt = inquirer.createPromptModule();
const destPath = resolve(process.cwd(), args.dest);
const workspacePath = getWorkspacePath(destPath);

const exportWorkspace = async (path: string) => {
    if (!args.export) return;
    const workspacePath = getWorkspacePath(path);
    if (!workspacePath) return;

    return $`structurizr-cli export -w ${workspacePath}/workspace.dsl -f json -o ${workspacePath} || true`;
};

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
        await exportWorkspace(
            relative(process.cwd(), destPath) || process.cwd(),
        );
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
    await exportWorkspace(relative(process.cwd(), workspacePath));
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}
