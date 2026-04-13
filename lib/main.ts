import { basename, relative, resolve } from "node:path";
import type { ExitPromptError } from "@inquirer/core";
import { select } from "@inquirer/prompts";
import { $, main as entrypoint } from "bun";
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
import {
    Elements,
    labelElementByName,
    SORTED_GENERATOR_AVAILABLE_ELEMENTS,
} from "./utils/labels";
import { checkUpdate } from "./utils/update";
import {
    getWorkspaceDslScope,
    getWorkspaceJson,
    getWorkspacePath,
} from "./utils/workspace";

type CLIArguments = {
    dest: string;
    version?: boolean;
    export?: boolean;
    dryRun?: boolean;
    _?: (string | number)[];
};

async function main(args: CLIArguments = { dest: "." }) {
    console.log(
        chalk.bold(`
Welcome to ${chalk.cyan(capitalCase(pkg.name.replace(/@[a-z-]*\//, "")))}
Create a Structurizr DSL scaffolding in seconds!
    `),
    );

    const destPath = resolve(process.cwd(), args.dest);
    const workspacePath = getWorkspacePath(destPath);

    const exportWorkspace = async (path: string) => {
        if (!args.export) return;
        const workspacePath = getWorkspacePath(path);
        if (!workspacePath) return;

        return $`docker run -t --rm -v ${workspacePath}:/usr/local/structurizr structurizr/structurizr export -w /usr/local/structurizr/workspace.dsl -f json -o /usr/local/structurizr || true`;
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
            const generator: Generator<GetAnswers<typeof workspaceGenerator>> =
                {
                    ...workspaceGenerator,
                    templates,
                    destPath,
                };

            await createGenerator(generator);
            await exportWorkspace(
                relative(process.cwd(), destPath) || process.cwd(),
            );
            const updateMessage = await checkUpdate(pkg.version);
            if (updateMessage) console.log(updateMessage);
            process.exit(0);
        } catch (err) {
            if ((err as ExitPromptError).name === "ExitPromptError") {
                console.log(chalk.yellow("\nOperation canceled by the user."));
                process.exit(0);
            }

            console.error(chalk.red("[ERROR]:"), err?.toString());
            console.log(chalk.gray("[DEBUG]:"), err as Error);
            process.exit(1);
        }
    }

    const workspaceInfo = await getWorkspaceJson(
        getWorkspacePath(workspacePath),
    );

    const workspaceScope =
        workspaceInfo?.configuration?.scope ??
        (await getWorkspaceDslScope(workspacePath));

    console.log(
        chalk.gray(`Workspace name: ${chalk.cyan(workspaceInfo?.name)}`),
    );
    console.log(
        chalk.gray(
            `Architecture folder: ${chalk.cyan(
                relative(process.cwd(), workspacePath),
            )}\n`,
        ),
    );

    const { getWorkspaceVersion } = await import("./utils/workspace-version");
    const { getPendingMigrations } = await import("./migrations/index");
    const wsVersion = await getWorkspaceVersion(
        `${workspacePath}/workspace.dsl`,
    );
    const pendingMigrations = getPendingMigrations(wsVersion);
    if (pendingMigrations.length > 0) {
        console.log(
            chalk.yellow("╭─────────────────────────────────────────╮"),
        );
        console.log(
            chalk.yellow("│  ⚠  Your workspace is outdated!         │"),
        );
        console.log(
            chalk.yellow("│  Run: scfz migrate                      │"),
        );
        console.log(
            chalk.yellow("╰─────────────────────────────────────────╯"),
        );
        console.log("");
    }

    const filteredGenerators = Object.values(otherGenerators).filter((g) => {
        if (!workspaceScope) return true;

        const sharedElements: string[] = [
            Elements.Archetype,
            Elements.Constant,
            Elements.ExternalSystem,
            Elements.View,
            Elements.DeploymentNode,
            Elements.Person,
            Elements.Relationship,
            Elements.Theme,
        ];

        if (workspaceScope === "Landscape") {
            return [...sharedElements, Elements.System].includes(g.name);
        } else {
            return [
                ...sharedElements,
                Elements.Container,
                Elements.Component,
            ].includes(g.name);
        }
    });
    try {
        const subcommand = args._?.[0]?.toString();

        if (subcommand) {
            if (subcommand === "migrate") {
                const { runMigrations } = await import("./migrations/index");
                await runMigrations(
                    workspacePath,
                    destPath,
                    Boolean(args.dryRun),
                );
                process.exit(0);
            }

            const matchedGenerator = filteredGenerators.find(
                (g) =>
                    g.name.toLowerCase().replace(/\s+/g, "-") ===
                    subcommand.toLowerCase(),
            );

            if (!matchedGenerator) {
                console.error(
                    chalk.red(
                        `[ERROR]: Generator "${subcommand}" not found or not allowed in current scope.`,
                    ),
                );
                process.exit(1);
            }

            type MatchedAnswers = GetAnswers<typeof matchedGenerator>;
            const directGenerator: Generator<MatchedAnswers> = {
                ...(matchedGenerator as GeneratorDefinition<MatchedAnswers>),
                templates,
                destPath,
            };

            await createGenerator(directGenerator);
            await exportWorkspace(relative(process.cwd(), workspacePath));
            const updateMessage = await checkUpdate(pkg.version);
            if (updateMessage) console.log(updateMessage);
            process.exit(0);
        }

        const element = await select({
            message: "Create a new element:",
            choices: Object.values(filteredGenerators)
                .map((g) => ({
                    name: `${labelElementByName(g.name)} ${g.name}`,
                    value: g,
                }))
                .toReversed()
                .toSorted((a, b) => {
                    const aIndex = SORTED_GENERATOR_AVAILABLE_ELEMENTS.indexOf(
                        a.value.name,
                    );
                    const bIndex = SORTED_GENERATOR_AVAILABLE_ELEMENTS.indexOf(
                        b.value.name,
                    );

                    return aIndex - bIndex;
                }),
        });

        type GeneratorAnswers = GetAnswers<typeof element>;

        const generator: Generator<GeneratorAnswers> = {
            ...(element as GeneratorDefinition<GeneratorAnswers>),
            templates,
            destPath,
        };

        await createGenerator(generator);
        await exportWorkspace(relative(process.cwd(), workspacePath));
        const updateMessage = await checkUpdate(pkg.version);
        if (updateMessage) console.log(updateMessage);
        process.exit(0);
    } catch (err) {
        if ((err as ExitPromptError).name === "ExitPromptError") {
            console.log(chalk.yellow("\nOperation canceled by the user."));
            process.exit(0);
        }

        console.error(err);
        process.exit(1);
    }
}

export default main;

if (["main.ts", "scfz"].includes(basename(entrypoint))) {
    const args: CLIArguments = await yargs(hideBin(process.argv))
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
            desc: "Use Structurizr unified CLI (Docker) to export the workspace to JSON",
        })
        .option("dry-run", {
            alias: "d",
            type: "boolean",
            default: false,
            desc: "Preview migration changes without applying",
        }).argv;

    main(args);
}
