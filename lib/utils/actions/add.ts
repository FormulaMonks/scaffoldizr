import { relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import { ActionTypes } from ".";
import { compileSource, compileTemplateFile } from "../handlebars";

export type AddAction = {
    type: ActionTypes.Add;
    templateFile: string;
    path: string;
    skipIfExists?: boolean;
};

export async function add<A extends Answers>(
    data: A,
    options: AddAction,
): Promise<boolean> {
    const compiledOpts = compileSource<AddAction>(options, data);
    const targetFile = file(compiledOpts.path);
    if (targetFile.size > 0 && compiledOpts.skipIfExists) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ./${relative(
                process.cwd(),
                compiledOpts.path,
            )}`,
        );
        return false;
    }

    const template = await compileTemplateFile(
        compiledOpts.templateFile,
        data,
        // Templates location relative to this file
        resolve(import.meta.dirname, "../.."),
    );

    await write(compiledOpts.path, template);

    console.log(
        `${chalk.gray("[ADDED]:")} ./${relative(
            process.cwd(),
            compiledOpts.path,
        )}`,
    );
    return true;
}
