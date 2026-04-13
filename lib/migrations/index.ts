import { resolve } from "node:path";
import chalk from "chalk";
import pkg from "../../package.json";
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
    const targetVersion = pkg.version;

    console.log(
        `Migrating workspace from v${currentVersion} to v${targetVersion}${dryRun ? " (DRY RUN)" : ""}\n`,
    );

    const pendingMigrations = getPendingMigrations(currentVersion);

    if (pendingMigrations.length === 0) {
        console.log(chalk.green("Workspace is already up to date."));
        return;
    }

    let anyApplied = false;

    for (const migration of pendingMigrations) {
        const result = await migration.apply(workspacePath, destPath, dryRun);
        if (result.applied) {
            anyApplied = true;
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

    if (anyApplied && !dryRun) {
        await updateWorkspaceVersion(workspaceDslPath, targetVersion, false);
    }

    if (dryRun) {
        console.log(
            chalk.yellow("No files written. Run without --dry-run to apply."),
        );
    }
}
