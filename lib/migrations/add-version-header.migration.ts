import { resolve } from "node:path";
import chalk from "chalk";
import { scfzVersion } from "../utils/scfz-version";
import {
    getWorkspaceVersion,
    updateWorkspaceVersion,
} from "../utils/workspace-version";
import type { Migration, MigrationResult } from "./types";

const description = "Add Scaffoldizr version header to workspace.dsl";

export const addVersionHeaderMigration: Migration = {
    fromVersion: "0.0.0",
    toVersion: "0.10.0",
    description,
    async apply(
        workspacePath: string,
        _destPath: string,
        dryRun: boolean,
    ): Promise<MigrationResult> {
        const workspaceDslPath = resolve(workspacePath, "workspace.dsl");
        const currentVersion = await getWorkspaceVersion(workspaceDslPath);

        if (currentVersion !== "0.0.0") {
            if (!dryRun) {
                console.log(
                    chalk.gray(
                        "[SKIPPED]: workspace.dsl already has version header",
                    ),
                );
            }
            return { applied: false, description, filesChanged: [] };
        }

        await updateWorkspaceVersion(workspaceDslPath, scfzVersion, dryRun);
        return { applied: true, description, filesChanged: ["workspace.dsl"] };
    },
};
