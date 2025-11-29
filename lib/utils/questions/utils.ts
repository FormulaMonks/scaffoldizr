import { Separator } from "@inquirer/prompts";

export const separator = (
    name: string,
    elements: unknown[],
): Separator | undefined => {
    const maybeSeparator = elements.length
        ? new Separator(`-- ${name} --`)
        : undefined;

    return maybeSeparator;
};
