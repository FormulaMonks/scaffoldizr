import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export const getWorkspacePath = (input: string): string | undefined => {
    let workspaceFullPath = resolve(`${input}/workspace.dsl`);
    let isWorkspace = existsSync(workspaceFullPath);

    if (isWorkspace) return workspaceFullPath;

    // Try again with the "architecture" inner path
    workspaceFullPath = resolve(`${input}/architecture/workspace.dsl`);
    isWorkspace = existsSync(workspaceFullPath);

    if (isWorkspace) return workspaceFullPath;

    return undefined;
};

export const getWorkspaceJson = async (
    workspaceFolder: string,
): Promise<Record<string, unknown>> => {
    if (existsSync(join(workspaceFolder, "/workspace.json"))) {
        const workspaceJson = await readFile(
            join(workspaceFolder, "/workspace.json"),
        );

        try {
            const workspaceInfo = JSON.parse(workspaceJson.toString());
            return workspaceInfo;
        } catch {}
    }

    return {};
};
