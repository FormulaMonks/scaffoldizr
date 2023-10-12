import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

export const getWorkspacePath = (input) => {
    let workspaceFullPath = resolve(`${input}/workspace.dsl`);
    let isWorkspace = existsSync(workspaceFullPath);

    if (isWorkspace) return workspaceFullPath;

    // Try again with the "architecture" inner path
    workspaceFullPath = resolve(`${input}/architecture/workspace.dsl`);
    isWorkspace = existsSync(workspaceFullPath);

    if (isWorkspace) return workspaceFullPath;

    return null;
};

export const getWorkspaceJson = async (workspaceFolder) => {
    if (existsSync(join(workspaceFolder, "/workspace.json"))) {
        const workspaceJson = await readFile(
            join(workspaceFolder, "/workspace.json"),
        );

        try {
            const workspaceInfo = JSON.parse(workspaceJson.toString());
            return workspaceInfo;
        } catch {
            return undefined;
        }
    }
};
