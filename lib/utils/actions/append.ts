import { access } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { $, file, write } from "bun";
import chalk from "chalk";
import type { ActionTypes, BaseAction, ExtendedAction } from ".";
import { compileSource, compileTemplateFile } from "../handlebars";

export type AppendAction<A extends Record<string, unknown>> = BaseAction<A> & {
    type: ActionTypes.Append;
    templateFile: string;
    path: string;
    filePermissions?: string;
    createIfNotExists?: boolean;
    pattern?: RegExp;
};

export async function append<A extends Record<string, unknown>>(
    options: ExtendedAction & AppendAction<A>,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        createIfNotExists = false,
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

    const compiledOpts = compileSource<AppendAction<A>>(opts, answers);
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
        if (!createIfNotExists)
            throw new Error(`File not found: ${targetFilePath}`);

        const template = await compileTemplateFile(
            templateLocation,
            answers,
            rootPath,
        );

        await write(targetFilePath, template);
        await $`chmod ${filePermissions} ${join(rootPath, compiledOpts.path)}`;

        console.log(`${chalk.gray("[ADDED]:")} ${relativePath}`);

        return true;
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

    let newContent = `${fileContents}\n${template}`;

    if (compiledOpts.pattern) {
        const [match] = fileContents.match(compiledOpts.pattern) ?? [];
        if (!match) {
            console.log(
                `${chalk.yellow(
                    "[WARN]:",
                )} ${relativePath} - No matches for pattern ${compiledOpts.pattern.toString()}`,
            );
        } else {
            const [part1, part2] = fileContents.split(match);
            newContent = `${part1}${match.trimEnd()}\n${template}${part2}`;
        }
    }

    await write(targetFilePath, newContent);

    console.log(`${chalk.gray("[UPDATED]:")} ${relativePath}`);

    return true;
}
