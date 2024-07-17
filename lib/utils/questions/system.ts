import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { input, select } from "@inquirer/prompts";
import { CancelablePromise } from "@inquirer/type";
import { kebabCase } from "change-case";
import type { Answers, AsyncDynamicQuestionProperty, Question } from "inquirer";
import { getWorkspacePath } from "../workspace";
import type { StructurizrWorkspace } from "../workspace";

type GetSystemQuestionOptions = {
    when?: AsyncDynamicQuestionProperty<boolean, Answers>;
    message?: string;
};

type SoftwareElement = StructurizrWorkspace["model"]["people"][number];
type SoftwareSystem = StructurizrWorkspace["model"]["softwareSystems"][number];
type DeploymentNode = StructurizrWorkspace["model"]["deploymentNodes"][number];

type GetAllSystemElementsOptions = {
    includeContainers?: boolean;
    includeDeploymentNodes?: boolean;
};

// TODO: Test filtering logic
export function getAllSystemElements(
    workspaceInfo: StructurizrWorkspace | undefined,
    {
        includeContainers = true,
        includeDeploymentNodes = false,
    }: GetAllSystemElementsOptions = {},
): ((SoftwareElement | DeploymentNode) & { systemName?: string })[] {
    if (!workspaceInfo) return [];
    const systemElements = Object.values(workspaceInfo.model)
        .flat()
        .filter((elm) =>
            !includeDeploymentNodes
                ? !elm.tags.split(",").includes("Deployment Node")
                : true,
        )
        .flatMap((elm) => {
            const sysElm = elm as SoftwareSystem;
            if (includeContainers && sysElm.containers) {
                return [
                    sysElm,
                    ...sysElm.containers.map((container) => ({
                        ...container,
                        systemName: sysElm.name,
                    })),
                ];
            }

            return elm;
        });

    return systemElements;
}

// TODO: Remove in favor of resolveSystemQuestion
export async function getSystemQuestion(
    workspace: string | StructurizrWorkspace,
    {
        when = () => true,
        message = "Relates to system:",
    }: GetSystemQuestionOptions = {},
): Promise<Question> {
    const workspaceInfo = typeof workspace !== "string" && workspace;

    if (workspaceInfo) {
        const systems = (workspaceInfo.model?.softwareSystems ?? [])
            .filter((system) => !system.tags.split(",").includes("External"))
            .map((system) => system.name);

        const systemQuestion = {
            type: "list",
            name: "systemName",
            message,
            choices: systems,
            when,
        };

        return systemQuestion;
    }

    const workspacePath = typeof workspace === "string" && workspace;
    if (!workspacePath) return {};

    const workspaceFolder = getWorkspacePath(workspacePath);

    const systemQuestion: Question = {
        type: "input",
        name: "systemName",
        message,
        when,
        validate: (input, answers) => {
            if (!answers) return true;

            answers.systemName = input;

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
    };

    return systemQuestion;
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
