import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { file } from "bun";
import { kebabCase } from "change-case";
import { input, select } from "../prompts";
import type { StructurizrWorkspace } from "../workspace";
import { getWorkspaceDslScope, getWorkspacePath } from "../workspace";

type SoftwareElement = StructurizrWorkspace["model"]["people"][number];
type SoftwareSystem = StructurizrWorkspace["model"]["softwareSystems"][number];
type DeploymentNode = StructurizrWorkspace["model"]["deploymentNodes"][number];

type GetAllWorkspaceElementsOptions = {
    includeContainers?: boolean;
    includeComponents?: boolean;
    includeDeploymentNodes?: boolean;
};

type WorkspaceElement = (SoftwareElement | DeploymentNode) & {
    systemName?: string;
    containerName?: string;
};

async function resolveSystemNameFromDsl(
    workspaceFolder: string,
): Promise<string | undefined> {
    try {
        const systemsFolder = join(workspaceFolder, "systems");
        const files = await readdir(systemsFolder);
        const systemFile = files.find((f) => f.endsWith(".dsl"));
        if (!systemFile) return undefined;

        const content = await file(join(systemsFolder, systemFile)).text();
        const match = content.match(/=\s*\S+\s+"([^"]+)"/);
        return match?.[1];
    } catch {
        return undefined;
    }
}

// TODO: Test filtering logic
export function getAllWorkspaceElements(
    workspaceInfo: StructurizrWorkspace | undefined,
    {
        includeContainers = true,
        includeComponents = false,
        includeDeploymentNodes = false,
    }: GetAllWorkspaceElementsOptions = {},
): WorkspaceElement[] {
    if (!workspaceInfo) return [];

    const systemElements = Object.values(workspaceInfo.model)
        .flat()
        .filter((elm) =>
            !includeDeploymentNodes
                ? !elm.tags?.split(",").includes("Deployment Node")
                : true,
        )
        .flatMap((elm) => {
            const sysElm = elm as SoftwareSystem;

            if (includeContainers && sysElm.containers) {
                return [
                    sysElm,
                    ...sysElm.containers.map((container) => {
                        if (includeComponents && container.components) {
                            return [
                                { ...container, systemName: sysElm.name },
                                ...container.components.map((component) => {
                                    return {
                                        ...component,
                                        containerName: container.name,
                                        systemName: sysElm.name,
                                    };
                                }),
                            ];
                        }

                        return {
                            ...container,
                            systemName: sysElm.name,
                        };
                    }),
                ] as WorkspaceElement[];
            }

            if (!elm.id) return undefined;

            return elm;
        })
        .filter(Boolean)
        .flat();

    return systemElements as SoftwareElement[];
}

export async function resolveSystemQuestion(
    workspace: string | StructurizrWorkspace,
    options: { message: string } = {
        message: "Relates to system:",
    },
): Promise<string> {
    const voidPromise: Promise<string> = Promise.resolve("");
    const workspaceInfo = typeof workspace !== "string" && workspace;

    if (workspaceInfo) {
        const workspaceScope =
            workspaceInfo?.configuration.scope?.toLowerCase();

        const systems = (workspaceInfo.model?.softwareSystems ?? [])
            .filter((system) => !system.tags.split(",").includes("External"))
            .map((system) => ({ name: system.name, value: system.name }));

        if (workspaceScope === "softwaresystem") {
            return Promise.resolve(systems[0].value);
        }

        if (systems.length === 0) {
            return voidPromise;
        }

        const systemQuestion = select({
            name: "systemName",
            message: options.message,
            choices: systems,
        });

        return systemQuestion;
    }

    const workspacePath = typeof workspace === "string" && workspace;
    if (!workspacePath) return voidPromise;

    const workspaceFolder = getWorkspacePath(workspacePath);
    if (!workspaceFolder) return voidPromise;

    const scope = await getWorkspaceDslScope(workspaceFolder);

    if (scope === "SoftwareSystem") {
        const systemName = await resolveSystemNameFromDsl(workspaceFolder);
        if (systemName) return systemName;
    }

    return input({
        name: "systemName",
        message: options.message,
        validate: async (inputValue) => {
            const systemPath = resolve(
                workspaceFolder,
                `containers/${kebabCase(inputValue)}`,
            );
            if (existsSync(systemPath)) return true;

            throw new Error(
                `System "${inputValue}" does not exist in the workspace.`,
            );
        },
    });
}
