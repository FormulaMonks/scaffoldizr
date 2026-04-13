import { chmod } from "node:fs/promises";
import { resolve } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import templates from "../templates/bundle";
import type { Migration, MigrationResult } from "./types";

const description =
    "Regenerate scripts/update.sh, update.ps1, run.sh, run.ps1 from latest templates";

const filesChanged = [
    "scripts/update.sh",
    "scripts/update.ps1",
    "scripts/run.sh",
    "scripts/run.ps1",
];

export const regenerateScriptsMigration: Migration = {
    fromVersion: "0.0.0",
    toVersion: "0.10.0",
    description,
    async apply(
        workspacePath: string,
        _destPath: string,
        dryRun: boolean,
    ): Promise<MigrationResult> {
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
        ];

        for (const entry of scriptEntries) {
            const templatePath = templates.get(entry.key);
            if (!templatePath) {
                throw new Error(`Template not found in bundle: ${entry.key}`);
            }
            const content = await file(templatePath).text();
            const absolutePath = resolve(workspacePath, entry.relativePath);

            if (dryRun) {
                console.log(
                    chalk.gray(
                        `[DRY RUN]: Would overwrite ${entry.relativePath}`,
                    ),
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
