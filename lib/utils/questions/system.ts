import { resolve } from "node:path";
import { file } from "bun";
import { kebabCase } from "change-case";
import type { Answers, AsyncDynamicQuestionProperty, Question } from "inquirer";
import { StructurizrWorkspace, getWorkspacePath } from "../workspace";

type GetSystemQuestionOptions = {
    when?: AsyncDynamicQuestionProperty<boolean, Answers>;
    message?: string;
};

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
                    `systems/${kebabCase(input)}.dsl`,
                );
                const isSystem = file(systemPath);
                if (isSystem.size > 0) return true;
            }

            throw new Error(
                `System "${input}" does not exist in the workspace.`,
            );
        },
    };

    return systemQuestion;
}
