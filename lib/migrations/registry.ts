import { regenerateScriptsMigration } from "./regenerate-scripts";
import type { Migration } from "./types";

export const migrations: Migration[] = [regenerateScriptsMigration];
