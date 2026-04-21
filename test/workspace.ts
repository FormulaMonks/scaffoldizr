import { spawn } from "bun";
import { keypress, loop } from "./io";

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

export const createWorkspaceInteractively = async (
    folder: string,
    scope = "landscape",
) => {
    const proc = spawn(["dist/scfz", "--dest", folder], {
        stdin: "pipe",
    });

    const scopeInputs =
        scope === "landscape"
            ? [keypress.DOWN, keypress.ENTER]
            : [keypress.ENTER];

    const systemInputs =
        scope === "softwaresystem"
            ? ["Test System", keypress.ENTER, keypress.ENTER]
            : [];

    loop(proc, [
        "Test Workspace",
        keypress.ENTER,
        keypress.ENTER,
        ...scopeInputs,
        800,
        ...systemInputs,
        keypress.ENTER,
        keypress.ENTER,
        "n",
        keypress.ENTER,
    ]);

    const response = await new Response(proc.stdout).text();
    console.log(`Scaffoldizr Output:\n${response}`);

    return response;
};
