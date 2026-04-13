export type MigrationResult = {
    applied: boolean;
    description: string;
    filesChanged: string[];
};

export type Migration = {
    fromVersion: string;
    toVersion: string;
    description: string;
    apply: (
        workspacePath: string,
        destPath: string,
        dryRun: boolean,
    ) => Promise<MigrationResult>;
};
