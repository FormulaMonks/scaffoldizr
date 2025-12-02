import { spawn } from "bun";
import { keypress, loop } from "./io";

export const createWorkspaceFromCLI = async (
    folder: string,
    scope = "landscape",
) => {
    const proc = spawn(["dist/scfz", "--dest", folder, "--export"], {
        stdin: "pipe",
    });

    loop(proc, [
        "Test Workspace",
        keypress.ENTER,
        keypress.ENTER,
        ...(scope === "landscape"
            ? [
                  keypress.DOWN, // Select landscape
                  keypress.ENTER,
              ]
            : [
                  keypress.ENTER, // Select softwaresystem
                  "Test System",
                  keypress.ENTER, // System Name
                  keypress.ENTER, // System Description
              ]),
        keypress.ENTER, // Author
        keypress.ENTER, // Email
        "n",
        keypress.ENTER, // Include default theme (Y/n)
    ]);

    const response = await new Response(proc.stdout).text();
    console.log(`Scaffoldizr Output:\n${response}`);

    return response;
};
