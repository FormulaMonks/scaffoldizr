import type { Subprocess } from "bun";

const INPUT_TIMEOUT = Number.parseInt(process.env.INPUT_TIMEOUT || "400", 10);

export const keypress = {
    DOWN: "\x1B\x5B\x42",
    UP: "\x1B\x5B\x41",
    ENTER: "\x0D",
    SPACE: "\x20",
};

export const loop = (
    process: Subprocess<"pipe", "pipe", "inherit">,
    inputs: string[],
) => {
    if (!inputs.length) {
        process.stdin.flush();
        process.stdin.end();

        // TODO: Handle I/O Error

        return;
    }

    const [input, ...rest] = inputs;
    if (typeof input === "string") {
        setTimeout(() => {
            process.stdin.write(input);
            loop(process, rest);
        }, INPUT_TIMEOUT);
    }
};
