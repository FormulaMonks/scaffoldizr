import { resolve } from "node:path";
import { file } from "bun";

export const skipUnlessViewType =
    <A extends Record<string, unknown>>(type: string) =>
    (answer: A) =>
        answer.viewType !== type && `View type "${type}" not selected.`;

export const whenViewType =
    <A extends Record<string, unknown>>(type: string) =>
    (answer: A) =>
        answer.viewType === type;

export const whenFileExists = async (
    filePath: string,
    workspacePath: string | undefined,
): Promise<boolean | string> => {
    if (!workspacePath) return false;
    const foundFile = file(resolve(workspacePath, filePath));

    return foundFile.size > 0;
};
