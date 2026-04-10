import { basename, dirname, join, resolve, sep } from "node:path";
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

export async function removeGitkeep(
    targetDir: string,
    rootPath: string,
): Promise<void> {
    const normalizedRoot = resolve(rootPath);
    let currentDir = resolve(targetDir);
    while (
        currentDir !== normalizedRoot &&
        currentDir.startsWith(normalizedRoot + sep)
    ) {
        const gitkeepFile = file(join(currentDir, ".gitkeep"));
        try {
            await gitkeepFile.unlink();
        } catch (error) {
            if (
                !(error instanceof Error) ||
                !("code" in error) ||
                (error as NodeJS.ErrnoException).code !== "ENOENT"
            ) {
                throw error;
            }
        }
        currentDir = dirname(currentDir);
    }
}

export function isGitkeep(filePath: string): boolean {
    return basename(filePath) === ".gitkeep";
}
