import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { kebabCase } from "change-case";
import type { Answers, AsyncDynamicQuestionProperty, Question } from "inquirer";
import { StructurizrWorkspace, getWorkspacePath } from "../workspace";

type GetSystemQuestionOptions = {
    when?: AsyncDynamicQuestionProperty<boolean, Answers>;
    message?: string;
};

type SoftwareElement = StructurizrWorkspace["model"]["people"][number];
type SoftwareSystem = StructurizrWorkspace["model"]["softwareSystems"][number];

type GetAllSystemElementsOptions = {
    includeContainers?: boolean;
};

export function getAllSystemElements(
    workspaceInfo: StructurizrWorkspace | undefined,
    { includeContainers = true }: GetAllSystemElementsOptions = {},
): (SoftwareElement & { systemName?: string })[] {
    if (!workspaceInfo) return [];
    const systemElements = Object.values(workspaceInfo.model)
        .flat()
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
