import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { input, select } from "@inquirer/prompts";
import { CancelablePromise } from "@inquirer/type";
import { kebabCase } from "change-case";
import { getWorkspacePath } from "../workspace";
import type { StructurizrWorkspace } from "../workspace";

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

            return elm;
        })
        .flat();

    return systemElements;
}

export function resolveSystemQuestion(
    workspace: string | StructurizrWorkspace,
    options: { message: string } = {
        message: "Relates to system:",
    },
): CancelablePromise<string> {
    const voidPromise: CancelablePromise<string> = new CancelablePromise(
        (resolve) => resolve(""),
    );
    const workspaceInfo = typeof workspace !== "string" && workspace;

    if (workspaceInfo) {
        const systems = (workspaceInfo.model?.softwareSystems ?? [])
            .filter((system) => !system.tags.split(",").includes("External"))
            .map((system) => ({ name: system.name, value: system.name }));

        const systemQuestion = select({
            message: options.message,
            choices: systems,
        });

        return systemQuestion;
    }

    const workspacePath = typeof workspace === "string" && workspace;
    if (!workspacePath) return voidPromise;

    const workspaceFolder = getWorkspacePath(workspacePath);

    return input({
        message: options.message,
        validate: async (input) => {
            if (workspaceFolder) {
                const systemPath = resolve(
                    workspaceFolder,
                    `containers/${kebabCase(input)}`,
                );
                if (existsSync(systemPath)) return true;
            }

            throw new Error(
                `System "${input}" does not exist in the workspace.`,
            );
        },
    });
}
