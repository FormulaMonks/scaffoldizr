import { join, relative, resolve } from "node:path";
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
    options: AddAction,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        when = () => true,
        skip = () => false,
        ...opts
    } = options;
    const compiledOpts = compileSource<AddAction>(opts, answers);
    const targetFile = file(resolve(rootPath, compiledOpts.path));

    const shouldSkip = !when(answers, rootPath) || skip(answers, rootPath);
    const relativePath = relative(rootPath, compiledOpts.path);

    if (shouldSkip || (targetFile.size > 0 && compiledOpts.skipIfExists)) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ${
                typeof shouldSkip === "string" ? shouldSkip : relativePath
            }`,
        );
        return false;
    }

    const templateLocation = templates.get(compiledOpts.templateFile);

    if (!templateLocation) {
        throw new Error(`Template not found: ${compiledOpts.templateFile}`);
    }

    const template = await compileTemplateFile(
        templateLocation,
        answers,
        rootPath,
    );

    await write(join(rootPath, compiledOpts.path), template);

    console.log(`${chalk.gray("[ADDED]:")} ${relativePath}`);

    return true;
}
