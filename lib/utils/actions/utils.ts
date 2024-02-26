import { resolve } from "node:path";
import { file } from "bun";

export const whenFileExists = async (
    filePath: string,
    workspacePath: string | undefined,
): Promise<boolean | string> => {
    if (!workspacePath) return false;
    const foundFile = file(resolve(workspacePath, filePath));

    return foundFile.size > 0;
};
