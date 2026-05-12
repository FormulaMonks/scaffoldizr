import { $ } from "bun";
import chalk from "chalk";
import { fetchLatestVersion } from "../utils/update";
import { isNewerVersion, stripVersionPrefix } from "../utils/version";

export async function runUpdate(currentVersion: string): Promise<void> {
    const latestVersion =
        process.env.SCFZ_FORCE_UPDATE_FETCH_FAIL !== undefined
            ? null
            : process.env.SCFZ_FORCE_UPDATE_VERSION?.trim() ||
              (await fetchLatestVersion(true));

    if (!latestVersion) {
        console.error(
            chalk.red("[ERROR]: Unable to fetch the latest scfz version."),
        );
        process.exit(1);
    }

    const normalizedCurrentVersion = stripVersionPrefix(currentVersion);
    const normalizedLatestVersion = stripVersionPrefix(latestVersion);

    if (!isNewerVersion(normalizedLatestVersion, normalizedCurrentVersion)) {
        console.log(
            chalk.green(
                `scfz is already up to date (v${normalizedCurrentVersion}).`,
            ),
        );
        return;
    }

    console.log(
        chalk.yellow(
            `Updating scfz from ${normalizedCurrentVersion} to ${normalizedLatestVersion}...`,
        ),
    );

    if (process.env.SCFZ_SKIP_UPDATE_INSTALL !== undefined) {
        console.log(chalk.yellow("Skipping install script in test mode."));
        return;
    }

    try {
        await $`curl -s https://formulamonks.github.io/scaffoldizr/assets/install.sh | sh`;
        console.log(
            chalk.green(`scfz updated to v${normalizedLatestVersion}.`),
        );
    } catch {
        console.error(chalk.red("[ERROR]: Failed to update scfz."));
        process.exit(1);
    }
}
