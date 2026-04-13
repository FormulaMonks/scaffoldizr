import pkg from "../../package.json";

export const scfzVersion: string = process.env.SCFZ_VERSION ?? pkg.version;
