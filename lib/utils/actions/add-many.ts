import { join } from "node:path";
import { Glob } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import { ActionTypes, BaseAction, add } from ".";
import { compileSource } from "../handlebars";

export type AddManyAction = BaseAction & {
    type: ActionTypes.AddMany;
    destination: string;
    templateFiles: string;
    skipIfExists?: boolean;
};

export async function addMany<A extends Answers>(
    options: AddManyAction,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        when = () => true,
        skip = () => false,
        ...opts
    } = options;
    const compiledOpts = compileSource<AddManyAction>(opts, answers);
    const pattern = new Glob(compiledOpts.templateFiles);

    const shouldSkip = !when(answers, rootPath) || skip(answers, rootPath);

    if (shouldSkip) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ${
                typeof shouldSkip === "string"
                    ? shouldSkip
                    : compiledOpts.templateFiles
            }`,
        );

        return false;
    }

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
