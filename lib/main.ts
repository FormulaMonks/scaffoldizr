import { relative, resolve } from "node:path";
import { select } from "@inquirer/prompts";
import { $ } from "bun";
import chalk from "chalk";
import { capitalCase } from "change-case";
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
import { getWorkspaceJson, getWorkspacePath } from "./utils/workspace";

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

        await createGenerator(generator);
        await exportWorkspace(
            relative(process.cwd(), destPath) || process.cwd(),
        );
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

const workspaceInfo = await getWorkspaceJson(getWorkspacePath(workspacePath));

console.log(chalk.gray(`Workspace name: ${chalk.cyan(workspaceInfo?.name)}`));
console.log(
    chalk.gray(
        `Architecture folder: ${chalk.cyan(
            relative(process.cwd(), workspacePath),
        )}\n`,
    ),
);

const DEFAULT_GENERATOR_SORTING = [
    "Workspace",
    "Constant",
    "System",
    "Person",
    "External System",
    "Container",
    "Component",
    "View",
    "Relationship",
];

const element = await select({
    message: "Create a new element:",
    choices: Object.values(otherGenerators)
        .map((g) => ({
            name: `${labelElementByName(g.name)} ${g.name}`,
            value: g,
        }))
        .toReversed()
        .toSorted((a, b) => {
            const aIndex = DEFAULT_GENERATOR_SORTING.indexOf(a.value.name);
            const bIndex = DEFAULT_GENERATOR_SORTING.indexOf(b.value.name);

            return aIndex - bIndex;
        }),
});

type GeneratorAnswers = GetAnswers<typeof element>;

try {
    const generator: Generator<GeneratorAnswers> = {
        ...(element as GeneratorDefinition<GeneratorAnswers>),
        templates,
        destPath,
    };

    await createGenerator(generator);
    await exportWorkspace(relative(process.cwd(), workspacePath));
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}
