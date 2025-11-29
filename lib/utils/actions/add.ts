import { chmod } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import { compileSource, compileTemplateFile } from "../handlebars";
import type { ActionTypes, BaseAction, ExtendedAction } from ".";

export type AddAction<A extends Record<string, unknown>> = BaseAction<A> & {
    type: ActionTypes.Add;
    templateFile: string;
    path: string;
    filePermissions?: string;
    skipIfExists?: boolean;
};

export async function add<A extends Record<string, unknown>>(
    options: ExtendedAction & AddAction<A>,
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
                    : resolve(rootPath, options.path)
            }`,
        );
        return false;
    }

    const compiledOpts = compileSource<AddAction<A>>(opts, answers);
    const targetFile = file(resolve(rootPath, compiledOpts.path));

    const relativePath = relative(
        process.cwd(),
        resolve(rootPath, compiledOpts.path),
    );

    if (targetFile.size > 0 && compiledOpts.skipIfExists) {
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
    await chmod(join(rootPath, compiledOpts.path), filePermissions);
    // await $`chmod ${filePermissions} ${join(rootPath, compiledOpts.path)}`;

    console.log(`${chalk.gray("[ADDED]:")} ${relativePath}`);

    return true;
}
