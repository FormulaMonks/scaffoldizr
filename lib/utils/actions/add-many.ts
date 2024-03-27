import { join } from "node:path";
import { Glob } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import type { BaseAction, ExtendedAction } from ".";
import { ActionTypes, add } from ".";
import { compileSource } from "../handlebars";

export type AddManyAction = BaseAction & {
    type: ActionTypes.AddMany;
    destination: string;
    templateFiles: string;
    filePermissions?: string;
    skipIfExists?: boolean;
};

export async function addMany<A extends Answers>(
    options: ExtendedAction & AddManyAction,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        when = () => true,
        skip = () => false,
        filePermissions = "644",
        ...opts
    } = options;
    const [doWhen, doSkip] = await Promise.all([
        when(answers, rootPath),
        skip(answers, rootPath),
    ]);

    const shouldSkip = doSkip || !doWhen;

    if (shouldSkip) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ${
                typeof shouldSkip === "string"
                    ? shouldSkip
                    : options.templateFiles
            }`,
        );

        return false;
    }
    const compiledOpts = compileSource<AddManyAction>(opts, answers);
    const pattern = new Glob(compiledOpts.templateFiles);

    const filesToCreate = [];

    for (const [path] of templates) {
        if (pattern.match(path)) {
            filesToCreate.push(
                add(
                    {
                        templates,
                        rootPath,
                        type: ActionTypes.Add,
                        templateFile: path,
                        filePermissions,
                        path: join(
                            compiledOpts.destination,
                            path.replace("templates", ""),
                        ),
                        skipIfExists: compiledOpts.skipIfExists,
                    },
                    answers,
                ),
            );
        }
    }

    const results = await Promise.all(filesToCreate);
    return results.some(Boolean) || false;
}
