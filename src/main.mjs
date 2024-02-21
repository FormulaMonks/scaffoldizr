#!/usr/bin/env node
import path from "node:path";
import minimist from "minimist";
import { Plop, run } from "plop";

const args = process.argv.slice(2);
const argv = minimist(args);

Plop.prepare(
    {
        cwd: argv.cwd ?? process.cwd(),
        configPath: path.resolve(import.meta.dirname, "plopfile.mjs"),
        preload: argv.preload || [],
        completion: argv.completion,
    },
    (env) => Plop.execute(env, run),
);
