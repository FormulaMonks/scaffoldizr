import { access } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import type { Answers } from "inquirer";
import { ActionTypes, BaseAction, ExtendedAction } from ".";
import { compileSource, compileTemplateFile } from "../handlebars";

export type AppendAction = BaseAction & {
    type: ActionTypes.Append;
    templateFile: string;
    path: string;
    pattern?: RegExp;
};

export async function append<A extends Answers>(
    options: ExtendedAction & AppendAction,
    answers: A,
): Promise<boolean> {
    const {
        templates,
        rootPath,
        when = () => true,
        skip = () => false,
        ...opts
    } = options;
    const compiledOpts = compileSource<AppendAction>(opts, answers);
    const targetFilePath = resolve(rootPath, compiledOpts.path);
    const relativePath = relative(process.cwd(), targetFilePath);
    const targetFile = file(targetFilePath);

    const [doWhen, doSkip] = await Promise.all([
        when(answers, rootPath),
        skip(answers, rootPath),
    ]);

    const shouldSkip = !doWhen || doSkip;

    if (shouldSkip) {
        console.log(
            `${chalk.gray("[SKIPPED]:")} ${
                typeof shouldSkip === "string" ? shouldSkip : relativePath
            }`,
        );
        return false;
    }

    // TODO: Extend functionality to create if file doesn't exist
    try {
        await access(targetFilePath);
    } catch {
        throw new Error(`File not found: ${targetFilePath}`);
    }

    const templateLocation = templates.get(compiledOpts.templateFile);

    if (!templateLocation) {
        throw new Error(`Template not found: ${compiledOpts.templateFile}`);
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
                `${chalk.gray(
                    "[SKIPPED]:",
                )} ${relativePath} - No matches for pattern`,
            );
            return false;
        }

        const [part1, part2] = fileContents.split(match);
        newContent = `${part1}${match.trimEnd()}\n${template}${part2}`;
    }

    await write(targetFilePath, newContent);

    console.log(`${chalk.gray("[UPDATED]:")} ${relativePath}`);

    return true;
}
