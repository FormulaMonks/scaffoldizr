import { chmod } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import { compileSource, compileTemplateFile } from "../handlebars";
import type { ActionTypes, BaseAction, ExtendedAction } from ".";
import { isGitkeep, removeGitkeep } from "./utils";

export type AddAction<A extends Record<string, unknown>> = BaseAction<A> & {
    type: ActionTypes.Add;
    templateFile: string;
    path: string;
    filePermissions?: string;
    skipIfExists?: boolean;
    dryRun?: boolean;
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
        dryRun = false,
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
    const targetFilePath = resolve(rootPath, compiledOpts.path);
    const targetFile = file(targetFilePath);
    const relativePath = relative(process.cwd(), targetFilePath);

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

    if (!dryRun) {
        await write(targetFilePath, template);
        await chmod(targetFilePath, filePermissions);
        if (!isGitkeep(targetFilePath)) {
            await removeGitkeep(dirname(targetFilePath), rootPath);
        }
    }

    console.log(
        `${chalk.gray(dryRun ? "[DRY RUN]:" : "[ADDED]:")} ${relativePath}`,
    );

    return true;
}
