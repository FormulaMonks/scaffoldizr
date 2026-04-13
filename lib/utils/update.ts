import { homedir } from "node:os";
import { join } from "node:path";
import { file, write } from "bun";
import chalk from "chalk";
import { buildBannerLine, buildBorder } from "./banner";
import { isNewerVersion, stripVersionPrefix } from "./version";

type UpdateCache = {
    latestVersion: string;
    checkedAt: number;
};

const UPDATE_CACHE_FILE = ".scaffoldizr-update.json";
const UPDATE_CHECK_WINDOW = 86_400_000;
const LATEST_RELEASE_URL =
    "https://api.github.com/repos/FormulaMonks/scaffoldizr/releases/latest";

function buildUpdateNotification(
    currentVersion: string,
    latestVersion: string,
): string {
    const versionText = `Update available: ${currentVersion} → ${latestVersion}`;
    const curlLine1 = "curl -s https://formulamonks.github.io/";
    const curlLine2 = "scaffoldizr/assets/install.sh | sh";
    const runToUpdateText = "Run to update:";

    const innerWidth = Math.max(
        versionText.length,
        curlLine1.length,
        curlLine2.length,
        runToUpdateText.length,
    );
    const horizontalBorder = buildBorder(innerWidth);

    return [
        "",
        chalk.yellow(`╭${horizontalBorder}╮`),
        chalk.yellow("│  ") +
            chalk.bold(versionText.padEnd(innerWidth)) +
            chalk.yellow("  │"),
        buildBannerLine("", innerWidth),
        buildBannerLine(runToUpdateText, innerWidth),
        chalk.yellow("│  ") +
            chalk.cyan(curlLine1.padEnd(innerWidth)) +
            chalk.yellow("  │"),
        chalk.yellow("│  ") +
            chalk.cyan(curlLine2.padEnd(innerWidth)) +
            chalk.yellow("  │"),
        chalk.yellow(`╰${horizontalBorder}╯`),
    ].join("\n");
}

async function readUpdateCache(
    cacheFilePath: string,
): Promise<UpdateCache | null> {
    try {
        const cacheContent = await file(cacheFilePath).text();
        const parsedCache = JSON.parse(cacheContent) as Partial<UpdateCache>;

        if (
            typeof parsedCache.latestVersion !== "string" ||
            typeof parsedCache.checkedAt !== "number"
        ) {
            return null;
        }

        return {
            latestVersion: parsedCache.latestVersion,
            checkedAt: parsedCache.checkedAt,
        };
    } catch {
        return null;
    }
}

async function refreshUpdateCache(cacheFilePath: string): Promise<void> {
    try {
        const latestReleaseResponse = await fetch(LATEST_RELEASE_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "scaffoldizr-cli",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            signal: AbortSignal.timeout(2000),
        });

        if (!latestReleaseResponse.ok) {
            return;
        }

        const releasePayload = (await latestReleaseResponse.json()) as {
            tag_name?: unknown;
        };

        if (typeof releasePayload.tag_name !== "string") {
            return;
        }

        const cachePayload: UpdateCache = {
            latestVersion: stripVersionPrefix(releasePayload.tag_name),
            checkedAt: Date.now(),
        };

        await write(cacheFilePath, JSON.stringify(cachePayload));
    } catch {}
}

export async function checkUpdate(
    currentVersion: string,
): Promise<string | null> {
    if (!process.stdout.isTTY) {
        return null;
    }

    if (process.env.SCFZ_NO_UPDATE_CHECK !== undefined) {
        return null;
    }

    const cacheFilePath = join(homedir(), UPDATE_CACHE_FILE);
    const cachedUpdate = await readUpdateCache(cacheFilePath);

    if (cachedUpdate) {
        const cacheIsFresh =
            Date.now() - cachedUpdate.checkedAt < UPDATE_CHECK_WINDOW;

        if (cacheIsFresh) {
            const normalizedCurrentVersion = stripVersionPrefix(currentVersion);
            const normalizedLatestVersion = stripVersionPrefix(
                cachedUpdate.latestVersion,
            );

            if (
                isNewerVersion(
                    normalizedLatestVersion,
                    normalizedCurrentVersion,
                )
            ) {
                return buildUpdateNotification(
                    normalizedCurrentVersion,
                    normalizedLatestVersion,
                );
            }

            return null;
        }
    }

    void refreshUpdateCache(cacheFilePath);
    return null;
}
