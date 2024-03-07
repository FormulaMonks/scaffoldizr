import { resolve } from "node:path";
import { file } from "bun";
import type { Answers } from "inquirer";

export const skipUnlessViewType = (type: string) => (answer: Answers) =>
    answer.viewType !== type && `View type "${type}" not selected.`;

export const whenViewType = (type: string) => (answer: Answers) =>
    answer.viewType === type;

export const whenFileExists = async (
    filePath: string,
    workspacePath: string | undefined,
): Promise<boolean | string> => {
    if (!workspacePath) return false;
    const foundFile = file(resolve(workspacePath, filePath));

    return foundFile.size > 0;
};
