import { promises as filesystem } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";

type UpdateCache = {
    latestVersion: string;
    checkedAt: number;
};

const UPDATE_CACHE_FILE = ".scaffoldizr-update.json";
const UPDATE_CHECK_WINDOW = 86_400_000;
const LATEST_RELEASE_URL =
    "https://api.github.com/repos/FormulaMonks/scaffoldizr/releases/latest";

function stripVersionPrefix(version: string): string {
    return version.replace(/^v/, "");
}

function versionToSegments(version: string): number[] {
    return stripVersionPrefix(version)
        .split(".")
        .map((versionSegment) => Number(versionSegment));
}

function isNewerVersion(
    latestVersion: string,
    currentVersion: string,
): boolean {
    const latestSegments = versionToSegments(latestVersion);
    const currentSegments = versionToSegments(currentVersion);
    const maxSegmentsLength = Math.max(
        latestSegments.length,
        currentSegments.length,
    );

    for (
        let segmentIndex = 0;
        segmentIndex < maxSegmentsLength;
        segmentIndex++
    ) {
        const latestSegment = latestSegments[segmentIndex] ?? 0;
        const currentSegment = currentSegments[segmentIndex] ?? 0;

        if (latestSegment > currentSegment) {
            return true;
        }

        if (latestSegment < currentSegment) {
            return false;
        }
    }

    return false;
}

function buildUpdateNotification(
    currentVersion: string,
    latestVersion: string,
): string {
    const versionLine = `│  Update available: ${currentVersion} → ${latestVersion}        │`;

    return [
        "",
        chalk.yellow("╭──────────────────────────────────────────────────╮"),
        chalk.bold(versionLine),
        chalk.yellow("│                                                  │"),
        chalk.yellow("│  Run to update:                                  │"),
        `${chalk.yellow("│  ")}${chalk.cyan("curl -s https://formulamonks.github.io/")}${chalk.yellow("         │")}`,
        `${chalk.yellow("│  ")}${chalk.cyan("scaffoldizr/assets/install.sh | sh")}${chalk.yellow("              │")}`,
        chalk.yellow("╰──────────────────────────────────────────────────╯"),
    ].join("\n");
}

async function readUpdateCache(
    cacheFilePath: string,
): Promise<UpdateCache | null> {
    try {
        const cacheContent = await filesystem.readFile(cacheFilePath, "utf8");
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

        await filesystem.writeFile(
            cacheFilePath,
            JSON.stringify(cachePayload),
            "utf8",
        );
    } catch {}
}

export async function checkUpdate(
    currentVersion: string,
): Promise<string | null> {
    if (!process.stdout.isTTY) {
        return null;
    }

    if (process.env.SCFZ_NO_UPDATE_CHECK) {
        return null;
    }

    if (!process.env.HOME) {
        return null;
    }

    const cacheFilePath = join(process.env.HOME, UPDATE_CACHE_FILE);
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
