import pkg from "../../package.json";

const normalizedScfzVersion = process.env.SCFZ_VERSION?.trim().replace(
    /^v/,
    "",
);

export const scfzVersion: string = normalizedScfzVersion
    ? normalizedScfzVersion
    : pkg.version;
