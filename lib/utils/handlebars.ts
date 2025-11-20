import { resolve } from "node:path";
import { file } from "bun";
import { camelCase, kebabCase, pascalCase } from "change-case";
import Handlebars from "handlebars";

export const removeSpaces = (txt = "") => txt.replace(/\s/g, "");
export const underscoreSpaces = (txt = "") => txt.replace(/\s/g, "_");

Handlebars.registerHelper("kebabCase", (target) => kebabCase(target));
Handlebars.registerHelper("properCase", (target) => pascalCase(target));
Handlebars.registerHelper("pascalCase", (target) => pascalCase(target));
Handlebars.registerHelper("camelCase", (target) => camelCase(target));
Handlebars.registerHelper("upperCase", (target = "") => target.toUpperCase());
Handlebars.registerHelper("lowerCase", (target = "") => target.toLowerCase());
Handlebars.registerHelper("eq", (arg1, arg2) => arg1 === arg2);
Handlebars.registerHelper("or", (arg1, arg2) => arg1 || arg2);
Handlebars.registerHelper("removeSpaces", (txt = "") => removeSpaces(txt));
Handlebars.registerHelper("underscoreSpaces", (txt = "") =>
    underscoreSpaces(txt),
);

export function compileSource<T extends Record<string, unknown>>(
    sourceObject: Record<string, unknown>,
    answers: Record<string, unknown>,
): T {
    return Object.fromEntries(
        Object.entries(sourceObject).map(([key, value]) => {
            const template =
                typeof value === "string"
                    ? Handlebars.compile(value)
                    : () => value;
            return [key, template(answers)];
        }),
    ) as T;
}

export async function compileTemplateFile(
    path: string,
    answers: Record<string, unknown>,
    dir: string = process.cwd(),
): Promise<string> {
    const templateFile = file(resolve(dir, path));
    const fileContents = await templateFile.text();
    const template = Handlebars.compile(fileContents);

    return template(answers);
}

export default Handlebars;
