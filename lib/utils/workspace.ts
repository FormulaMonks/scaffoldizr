import { join, resolve } from "node:path";
import { file } from "bun";

export const getWorkspacePath = (input: string): string | undefined => {
    let workspaceFullPath = resolve(`${input}/workspace.dsl`);
    let workspaceFile = file(workspaceFullPath);

    if (workspaceFile.size > 0) return workspaceFullPath;

    // Try again with the "architecture" inner path
    workspaceFullPath = resolve(`${input}/architecture/workspace.dsl`);
    workspaceFile = file(workspaceFullPath);

    if (workspaceFile.size > 0) return workspaceFullPath;

    return undefined;
};

export const getWorkspaceJson = async (
    workspaceFolder: string,
): Promise<Record<string, unknown>> => {
    const workspaceFile = file(join(workspaceFolder, "/workspace.json"));

    if (workspaceFile.size > 0) {
        const workspaceJson = await workspaceFile.json();
        return workspaceJson;
    }

    return {};
};
