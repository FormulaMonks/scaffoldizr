import { join, relative, resolve } from "node:path";
import { $, file, write } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import { ActionTypes, BaseAction, ExtendedAction } from ".";
import { compileSource, compileTemplateFile } from "../handlebars";

export type AddAction = BaseAction & {
    type: ActionTypes.Add;
    templateFile: string;
    path: string;
    filePermissions?: string;
    skipIfExists?: boolean;
};

export async function add<A extends Answers>(
    options: ExtendedAction & AddAction,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        filePermissions = "644",
        when = () => true,
        skip = () => false,
        ...opts
    } = options;
    const compiledOpts = compileSource<AddAction>(opts, answers);
    const targetFile = file(resolve(rootPath, compiledOpts.path));

    const [doWhen, doSkip] = await Promise.all([
        when(answers, rootPath),
        skip(answers, rootPath),
    ]);

    const shouldSkip = !doWhen || doSkip;

    const relativePath = relative(
        process.cwd(),
        resolve(rootPath, compiledOpts.path),
    );

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
    await $`chmod ${filePermissions} ${join(rootPath, compiledOpts.path)}`;

    console.log(`${chalk.gray("[ADDED]:")} ${relativePath}`);

    return true;
}
