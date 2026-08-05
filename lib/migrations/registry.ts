import { addStandaloneScriptsMigration } from "./add-standalone-scripts.migration";
import { addVersionHeaderMigration } from "./add-version-header.migration";
import { addWorkspaceMaxSizeMigration } from "./add-workspace-maxsize.migration";
import { regenerateScriptsMigration } from "./regenerate-scripts.migration";
import type { Migration } from "./types";

export const migrations: Migration[] = [
    addVersionHeaderMigration,
    regenerateScriptsMigration,
    addStandaloneScriptsMigration,
    addWorkspaceMaxSizeMigration,
];
