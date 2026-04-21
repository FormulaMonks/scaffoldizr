import { spawn } from "bun";

export const createWorkspaceFromCLI = async (
    folder: string,
    scope = "landscape",
) => {
    const softwaresystemArgs =
        scope === "softwaresystem"
            ? [
                  "--systemName",
                  "Test System",
                  "--systemDescription",
                  "Untitled System",
              ]
            : [];

    const proc = spawn(
        [
            "dist/scfz",
            "--dest",
            folder,
            "--export",
            "--workspaceName",
            "Test Workspace",
            "--workspaceDescription",
            "Untitled Workspace",
            "--workspaceScope",
            scope,
            ...softwaresystemArgs,
            "--authorName",
            "Test Author",
            "--authorEmail",
            "test@example.com",
            "--shouldIncludeTheme",
            "false",
        ],
        {
            stdin: "ignore",
        },
    );

    const response = await new Response(proc.stdout).text();
    console.log(`Scaffoldizr Output:\n${response}`);

    return response;
};
