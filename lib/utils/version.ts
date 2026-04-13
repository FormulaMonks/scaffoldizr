export function stripVersionPrefix(version: string): string {
    return version.replace(/^v/, "");
}

export function versionToSegments(version: string): number[] {
    return stripVersionPrefix(version)
        .split(".")
        .map((versionSegment) => Number(versionSegment));
}

export function isNewerVersion(
    latestVersion: string,
    currentVersion: string,
): boolean {
    const latestSegments = versionToSegments(latestVersion);
    const currentSegments = versionToSegments(currentVersion);

    if (
        latestSegments.some(Number.isNaN) ||
        currentSegments.some(Number.isNaN)
    ) {
        return false;
    }

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
        if (latestSegment !== currentSegment)
            return latestSegment > currentSegment;
    }

    return false;
}
