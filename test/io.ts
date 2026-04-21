import type { Subprocess } from "bun";

const INPUT_TIMEOUT = Number.parseInt(process.env.INPUT_TIMEOUT || "400", 10);

export const keypress = {
    DOWN: "\x1B\x5B\x42",
    UP: "\x1B\x5B\x41",
    ENTER: "\x0D",
    SPACE: "\x20",
};

export type LoopInput = string | number;

export const loop = (
    process: Subprocess<"pipe", "pipe", "inherit">,
    inputs: LoopInput[],
) => {
    if (!inputs.length) {
        process.stdin.flush();
        process.stdin.end();

        // TODO: Handle I/O Error

        return;
    }

    const [input, ...rest] = inputs;
    if (typeof input === "number") {
        // A number is a bare pause (ms) with no stdin write. Insert one after
        // a select-confirm ENTER so @inquirer/core's readline cleanup finishes
        // before the next input arrives, preventing it from being swallowed by
        // the outgoing prompt's event listener.
        setTimeout(() => loop(process, rest), input);
    } else {
        setTimeout(() => {
            process.stdin.write(input);
            loop(process, rest);
        }, INPUT_TIMEOUT);
    }
};
