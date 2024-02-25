import { resolve } from "node:path";
import { file } from "bun";
import { kebabCase } from "change-case";
import type { Question } from "inquirer";
import { getWorkspacePath } from "../workspace";

export async function getSystemQuestion(
    workspacePath: string,
    when = () => true,
): Promise<Question> {
    const systemQuestion: Question = {
        type: "input",
        name: "systemName",
        message: "Base system name:",
        when,
        validate: (input, answers) => {
            if (!answers) return true;

            answers.systemName = input;
            const workspaceFolder = getWorkspacePath(workspacePath);

            if (workspaceFolder) {
                const systemPath = resolve(
                    workspaceFolder,
                    `views/${kebabCase(input)}.dsl`,
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
