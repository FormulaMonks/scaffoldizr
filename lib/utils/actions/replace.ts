import { access } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import { compileSource, compileTemplateFile } from "../handlebars";
import type { ActionTypes, BaseAction, ExtendedAction } from ".";

export type ReplaceAction<A extends Record<string, unknown>> = BaseAction<A> & {
    type: ActionTypes.Replace;
    templateFile: string;
    path: string;
    pattern: RegExp;
    filePermissions?: string;
};

export async function replace<A extends Record<string, unknown>>(
    options: ExtendedAction & ReplaceAction<A>,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
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

    const compiledOpts = compileSource<ReplaceAction<A>>(opts, answers);
    const targetFilePath = resolve(rootPath, compiledOpts.path);
    const relativePath = relative(process.cwd(), targetFilePath);
    const targetFile = file(targetFilePath);

    const templateLocation = templates.get(compiledOpts.templateFile);

    if (!templateLocation) {
        throw new Error(`Template not found: ${compiledOpts.templateFile}`);
    }

    try {
        await access(targetFilePath);
    } catch {
        throw new Error(`File not found: ${targetFilePath}`);
    }

    const templatePromise = compileTemplateFile(
        templateLocation,
        answers,
        rootPath,
    );
    const fileContentsPromise = targetFile.text();

    const [template, fileContents] = await Promise.all([
        templatePromise,
        fileContentsPromise,
    ]);

    const [match] = fileContents.match(compiledOpts.pattern) ?? [];

    if (!match) {
        console.log(
            `${chalk.yellow("[WARN]:")} ${relativePath} - No matches for pattern ${compiledOpts.pattern.toString()}`,
        );
        return false;
    }

    const newContent = fileContents.replace(match, template);

    await write(targetFilePath, newContent);

    console.log(`${chalk.gray("[UPDATED]:")} ${relativePath}`);

    return true;
}
