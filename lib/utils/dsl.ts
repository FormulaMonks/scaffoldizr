import { file } from "bun";

export const getWorkspaceThemes = async (
    workspaceDslPath: string,
): Promise<string[]> => {
    const workspaceFile = file(workspaceDslPath);

    if (!(await workspaceFile.exists())) {
        throw new Error(`Workspace DSL file not found: ${workspaceDslPath}`);
    }

    const workspaceDslContent = await workspaceFile.text();
    const themesMatch = workspaceDslContent.match(/themes\s+((?:"[^"]*"\s*)+)/);

    if (!themesMatch) {
        return [];
    }

    const capturedThemes = themesMatch[1];
    const extractedThemes: string[] = [];

    for (const extractedThemeMatch of capturedThemes.matchAll(/"([^"]*)"/g)) {
        const extractedThemeUrl = extractedThemeMatch[1];

        if (typeof extractedThemeUrl === "string") {
            extractedThemes.push(extractedThemeUrl);
        }
    }

    return extractedThemes;
};
