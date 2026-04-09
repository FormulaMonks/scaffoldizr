import { join } from "node:path";
import { file, write } from "bun";
import {
    ActionTypes,
    type AppendAction,
    type ReplaceAction,
} from "../utils/actions";
import { getWorkspaceThemes } from "../utils/dsl";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { checkbox, input, select } from "../utils/prompts";
import { BUILTIN_THEMES, COLOR_THEME_URLS } from "../utils/themes";

type ThemeAnswers = {
    selectedThemes: string[];
    hasExistingThemesLine: boolean;
};

const generator: GeneratorDefinition<ThemeAnswers> = {
    name: Elements.Theme,
    description: "Manage workspace themes",
    questions: async (generator) => {
        const workspaceDslPath = join(
            generator.destPath,
            "architecture/workspace.dsl",
        );

        const themeAction = await select({
            name: "themeAction",
            message: "What do you want to do?",
            choices: ["Add themes", "Remove themes", "List themes"],
        });

        if (themeAction === "List themes") {
            const selectedThemes = await getWorkspaceThemes(workspaceDslPath);

            if (selectedThemes.length === 0) {
                console.log("No themes configured in workspace.dsl");
            } else {
                console.log("Current themes:");
                for (const themeUrl of selectedThemes) {
                    console.log(`- ${themeUrl}`);
                }
            }

            return { selectedThemes: [], hasExistingThemesLine: false };
        }

        if (themeAction === "Add themes") {
            const selectedThemes = await checkbox({
                name: "additionalThemes",
                message: "Select themes to add:",
                choices: BUILTIN_THEMES,
            });

            let customThemeUrl = "";
            if (selectedThemes.includes("custom")) {
                customThemeUrl = await input({
                    name: "customThemeUrl",
                    message: "Custom theme URL:",
                    validate: (value: string) => {
                        const trimmedValue = value.trim();

                        if (trimmedValue.length === 0)
                            return "Custom theme URL is required";

                        return /^https?:\/\/.+/.test(trimmedValue)
                            ? true
                            : "Enter a valid URL starting with http:// or https://";
                    },
                });
            }

            const currentThemes = await getWorkspaceThemes(workspaceDslPath);
            const newSelectionHasColor =
                selectedThemes.some((t) =>
                    (COLOR_THEME_URLS as string[]).includes(t),
                ) ||
                (customThemeUrl.trim().length > 0 &&
                    (COLOR_THEME_URLS as string[]).includes(
                        customThemeUrl.trim(),
                    ));

            const baseThemes = newSelectionHasColor
                ? currentThemes.filter(
                      (t) => !(COLOR_THEME_URLS as string[]).includes(t),
                  )
                : currentThemes;

            const finalSelectedThemes = Array.from(
                new Set([
                    ...baseThemes,
                    ...selectedThemes.filter((theme) => theme !== "custom"),
                    ...(customThemeUrl.trim().length > 0
                        ? [customThemeUrl.trim()]
                        : []),
                ]),
            );

            if (finalSelectedThemes.length === 0) {
                console.log(
                    "No themes selected. Existing themes will stay unchanged",
                );
            }

            const dslContent = await file(workspaceDslPath).text();
            const hasExistingThemesLine = /themes(?:\s+"[^"]*")*/.test(
                dslContent,
            );

            return {
                selectedThemes: finalSelectedThemes,
                hasExistingThemesLine,
            };
        }

        const currentThemes = await getWorkspaceThemes(workspaceDslPath);

        if (currentThemes.length === 0) {
            console.log("No themes configured in workspace.dsl");
            return { selectedThemes: [], hasExistingThemesLine: false };
        }

        const themesToRemove = await checkbox({
            name: "themesToRemove",
            message: "Select themes to remove:",
            choices: currentThemes.map((themeUrl) => ({
                name: themeUrl,
                value: themeUrl,
            })),
        });

        if (themesToRemove.length === 0) {
            console.log(
                "No themes selected for removal. Existing themes will stay unchanged",
            );
        }

        const selectedThemes = currentThemes.filter(
            (themeUrl) => !themesToRemove.includes(themeUrl),
        );

        if (themesToRemove.length > 0 && selectedThemes.length === 0) {
            const dslContent = await file(workspaceDslPath).text();
            const cleaned = dslContent.replace(
                /[ \t]*themes(?:\s+"[^"]*")*\n?/,
                "",
            );
            await write(workspaceDslPath, cleaned);
            console.log("All themes removed from workspace.dsl");
            return { selectedThemes: [], hasExistingThemesLine: false };
        }

        return { selectedThemes, hasExistingThemesLine: true };
    },
    actions: [
        {
            type: ActionTypes.Replace,
            path: "architecture/workspace.dsl",
            pattern: /themes(?:\s+"[^"]*")*/,
            templateFile: "templates/theme.hbs",
            when: (answers) =>
                answers.selectedThemes.length > 0 &&
                answers.hasExistingThemesLine,
        } as ReplaceAction<ThemeAnswers>,
        {
            type: ActionTypes.Append,
            path: "architecture/workspace.dsl",
            pattern: /views\s*\{/,
            templateFile: "templates/theme.hbs",
            when: (answers) =>
                answers.selectedThemes.length > 0 &&
                !answers.hasExistingThemesLine,
        } as AppendAction<ThemeAnswers>,
    ],
};

export default generator;
