import { afterAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { $, file, spawn } from "bun";
import { createWorkspaceFromCLI } from "../test/workspace";

const TMP_FOLDER = process.env.TMP_FOLDER || "/tmp";

describe("e2e: theme command", () => {
    const folder = join(
        TMP_FOLDER,
        `test-${(1000 + Math.ceil(Math.random() * 1000)).toString(16)}`,
    );

    afterAll(async () => {
        await $`rm -rf ${folder}`;
    });

    test("@smoke: should add a theme with correct indentation", async () => {
        await createWorkspaceFromCLI(folder, "landscape");

        const proc = spawn([
            "dist/scfz",
            "theme",
            "--dest",
            folder,
            "--themeAction",
            "Add themes",
            "--additionalThemes",
            "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-default.json",
        ]);

        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const workspaceContents = await file(
            `${folder}/architecture/workspace.dsl`,
        ).text();
        expect(workspaceContents).toMatch(/^        themes /m);
    });
});
