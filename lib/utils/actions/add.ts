import { relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import { ActionTypes, BaseAction } from ".";
import { compileSource, compileTemplateFile } from "../handlebars";

export type AddAction = BaseAction & {
    type: ActionTypes.Add;
    templateFile: string;
    path: string;
    skipIfExists?: boolean;
};

export async function add<A extends Answers>(
    data: A,
    options: AddAction,
): Promise<boolean> {
    const { templates, rootPath, ...opts } = options;
    const compiledOpts = compileSource<AddAction>(opts, data);
    const targetFile = file(resolve(rootPath, compiledOpts.path));

    if (targetFile.size > 0 && compiledOpts.skipIfExists) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ./${relative(
                rootPath,
                compiledOpts.path,
            )}`,
        );
        return false;
    }

    const templateLocation = templates.get(compiledOpts.templateFile);

    if (!templateLocation) {
        throw new Error(`Template not found: ${compiledOpts.templateFile}`);
    }

    const template = await compileTemplateFile(
        templateLocation,
        data,
        rootPath,
    );

    await write(resolve(rootPath, compiledOpts.path), template);

    console.log(
        `${chalk.gray("[ADDED]:")} ./${relative(rootPath, compiledOpts.path)}`,
    );
    return true;
}
