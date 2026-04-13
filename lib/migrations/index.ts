import { resolve } from "node:path";
import chalk from "chalk";
import { scfzVersion } from "../utils/scfz-version";
import { isNewerVersion } from "../utils/version";
import {
    getWorkspaceVersion,
    updateWorkspaceVersion,
} from "../utils/workspace-version";
import { migrations } from "./registry";
import type { Migration } from "./types";

export function getPendingMigrations(currentVersion: string): Migration[] {
    return migrations.filter((migration) =>
        isNewerVersion(migration.toVersion, currentVersion),
    );
}

export async function runMigrations(
    workspacePath: string,
    destPath: string,
    dryRun: boolean = false,
): Promise<void> {
    const workspaceDslPath = resolve(workspacePath, "workspace.dsl");
    const currentVersion = await getWorkspaceVersion(workspaceDslPath);
    const targetVersion = scfzVersion;

    console.log(
        `Migrating workspace from v${currentVersion} to v${targetVersion}${dryRun ? " (DRY RUN)" : ""}\n`,
    );

    const pendingMigrations = getPendingMigrations(currentVersion);

    if (pendingMigrations.length === 0) {
        if (isNewerVersion(targetVersion, currentVersion)) {
            console.log(chalk.green("No migrations to apply."));
            await updateWorkspaceVersion(
                workspaceDslPath,
                targetVersion,
                dryRun,
            );
        } else {
            console.log(chalk.green("Workspace is already up to date."));
        }
        return;
    }

    for (const migration of pendingMigrations) {
        const result = await migration.apply(workspacePath, destPath, dryRun);
        if (result.applied) {
            console.log(`  ${chalk.green("✔")} ${migration.description}`);
            for (const changedFile of result.filesChanged) {
                console.log(`    - ${changedFile}`);
            }
        } else {
            console.log(
                `  ${chalk.gray("○")} ${migration.description} (Skipped)`,
            );
        }
    }

    if (!dryRun) {
        await updateWorkspaceVersion(workspaceDslPath, targetVersion, false);
    } else {
        await updateWorkspaceVersion(workspaceDslPath, targetVersion, true);
        console.log(
            chalk.yellow("No files written. Run without --dry-run to apply."),
        );
    }
}
