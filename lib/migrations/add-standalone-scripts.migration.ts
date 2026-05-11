import { chmod } from "node:fs/promises";
import { resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import templates from "../templates/bundle";
import Handlebars from "../utils/handlebars";
import { structurizrVersion } from "../utils/structurizr-version";
import type { Migration, MigrationResult } from "./types";

const description =
    "Regenerate scripts with locked Structurizr version and add export/inspect standalones";

const filesChanged = [
    "scripts/run.sh",
    "scripts/run.ps1",
    "scripts/update.sh",
    "scripts/update.ps1",
    "scripts/export.sh",
    "scripts/export.ps1",
    "scripts/inspect.sh",
    "scripts/inspect.ps1",
];

const scriptEntries = [
    {
        key: "templates/scripts/run.sh",
        relativePath: "scripts/run.sh",
        executable: true,
    },
    {
        key: "templates/scripts/run.ps1",
        relativePath: "scripts/run.ps1",
        executable: false,
    },
    {
        key: "templates/scripts/update.sh",
        relativePath: "scripts/update.sh",
        executable: true,
    },
    {
        key: "templates/scripts/update.ps1",
        relativePath: "scripts/update.ps1",
        executable: false,
    },
    {
        key: "templates/scripts/export.sh",
        relativePath: "scripts/export.sh",
        executable: true,
    },
    {
        key: "templates/scripts/export.ps1",
        relativePath: "scripts/export.ps1",
        executable: false,
    },
    {
        key: "templates/scripts/inspect.sh",
        relativePath: "scripts/inspect.sh",
        executable: true,
    },
    {
        key: "templates/scripts/inspect.ps1",
        relativePath: "scripts/inspect.ps1",
        executable: false,
    },
];

export const addStandaloneScriptsMigration: Migration = {
    fromVersion: "0.0.0",
    toVersion: "0.11.4",
    description,
    async apply(
        workspacePath: string,
        _destPath: string,
        dryRun: boolean,
    ): Promise<MigrationResult> {
        for (const entry of scriptEntries) {
            const templatePath = templates.get(entry.key);
            if (!templatePath) {
                throw new Error(`Template not found in bundle: ${entry.key}`);
            }
            const rawContent = await file(templatePath).text();
            const content = Handlebars.compile(rawContent)({
                structurizrVersion,
            });
            const absolutePath = resolve(workspacePath, entry.relativePath);

            if (dryRun) {
                console.log(
                    chalk.gray(`[DRY RUN]: Would write ${entry.relativePath}`),
                );
            } else {
                await write(absolutePath, content);
                if (entry.executable) {
                    await chmod(absolutePath, 0o744);
                }
                console.log(chalk.gray(`[UPDATED]: ${entry.relativePath}`));
            }
        }

        return {
            applied: true,
            description,
            filesChanged,
        };
    },
};
