import { addVersionHeaderMigration } from "./add-version-header.migration";
import { regenerateScriptsMigration } from "./regenerate-scripts.migration";
import type { Migration } from "./types";

export const migrations: Migration[] = [
    addVersionHeaderMigration,
    regenerateScriptsMigration,
];
