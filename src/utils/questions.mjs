import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { kebabCase } from "change-case";

import { getWorkspaceJson } from "./workspace.mjs";

export const withSystemsQuestion =
    (
        questions = [],
        {
            workspaceFolder,
            questionMessage = "Reference system (to integrate with):",
            position = 0,
            when = () => true,
        } = {},
    ) =>
    async (inquirer) => {
        let systemQuestion = {
            type: "input",
            name: "systemName",
            message: "Base system name:",
            when,
            validate: (input, answers) => {
                answers.systemName = input;
                const systemPath = resolve(
                    `${workspaceFolder}/views/${kebabCase(input)}.dsl`,
                );
                const isSystem = existsSync(systemPath);
                if (isSystem) return true;

                throw new Error(
                    `System "${systemPath}" does not exist in the workspace`,
                );
            },
        };

        const workspaceInfo = await getWorkspaceJson(workspaceFolder);
        if (workspaceInfo) {
            const systems = workspaceInfo.model.softwareSystems
                .filter(
                    (system) => !system.tags.split(",").includes("External"),
                )
                .map((system) => system.name);

            systemQuestion = {
                type: "list",
                name: "systemName",
                message: questionMessage,
                choices: systems,
                when,
            };
        }

        questions.splice(position, 0, systemQuestion);

        return inquirer.prompt(questions.filter(Boolean));
    };
