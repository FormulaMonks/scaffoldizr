import {
    checkbox as inquirerCheckbox,
    confirm as inquirerConfirm,
    input as inquirerInput,
    select as inquirerSelect,
    Separator,
} from "@inquirer/prompts";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

type ValidateResult = string | boolean | Promise<string | boolean>;

type InputConfig = {
    message: string;
    default?: string;
    required?: boolean;
    validate?: (value: string) => ValidateResult;
    [key: string]: unknown;
};

type SelectChoice<Value> = {
    value: Value;
    name?: string;
    description?: string;
    disabled?: boolean | string;
    type?: never;
};

type SelectConfig<Value> = {
    message: string;
    choices: ReadonlyArray<Separator | Value | SelectChoice<Value>>;
    default?: Value;
    [key: string]: unknown;
};

type ConfirmConfig = {
    message: string;
    default?: boolean;
    [key: string]: unknown;
};

type CheckboxChoice<Value> = {
    value: Value;
    name?: string;
    disabled?: boolean | string;
    checked?: boolean;
    type?: never;
};

type CheckboxConfig<Value> = {
    message: string;
    choices: ReadonlyArray<string | Separator | CheckboxChoice<Value>>;
    validate?: (
        choices: ReadonlyArray<CheckboxChoice<Value>>,
    ) => ValidateResult;
    [key: string]: unknown;
};

type WithOptionalName<T> = T & { name?: string };

let cachedArgv: Record<string, string | undefined> | undefined;

export function resetArgvCache(): void {
    cachedArgv = undefined;
}

function parseArgv(): Record<string, string | undefined> {
    if (cachedArgv !== undefined) return cachedArgv;

    const parsed = yargs(hideBin(process.argv)).parseSync();
    const result: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(parsed)) {
        if (key !== "_" && key !== "$0" && value !== undefined) {
            result[key] = String(value);
        }
    }

    cachedArgv = result;
    return cachedArgv;
}

function getCliValue(name: string | undefined): string | undefined {
    if (name === undefined) return undefined;
    return parseArgv()[name];
}

async function runValidation(
    value: string,
    validate: (value: string) => ValidateResult,
): Promise<void> {
    const result = await validate(value);
    if (result !== true) {
        const message =
            typeof result === "string" ? result : "Validation failed";
        throw new Error(message);
    }
}

export async function input(
    config: WithOptionalName<InputConfig>,
): Promise<string> {
    const { name, ...rest } = config;

    const cliValue = getCliValue(name);
    if (cliValue === undefined)
        return inquirerInput(rest as Parameters<typeof inquirerInput>[0]);

    if (rest.validate !== undefined) {
        await runValidation(cliValue, rest.validate);
    }
    return cliValue;
}

export async function select<Value>(
    config: WithOptionalName<SelectConfig<Value>>,
): Promise<Value> {
    const { name, ...rest } = config;

    const cliValue = getCliValue(name);
    if (cliValue === undefined)
        return inquirerSelect(
            rest as Parameters<typeof inquirerSelect>[0],
        ) as Promise<Value>;

    const nonSeparatorChoices = rest.choices.filter(
        (choice): choice is SelectChoice<Value> | Value =>
            !(choice instanceof Separator),
    );

    for (const choice of nonSeparatorChoices) {
        if (
            choice !== null &&
            typeof choice === "object" &&
            "value" in choice
        ) {
            const typed = choice as SelectChoice<Value>;
            if (String(typed.value) === cliValue) {
                return typed.value;
            }
        } else if (String(choice) === cliValue) {
            return choice as Value;
        }
    }

    throw new Error(
        `Invalid value "${cliValue}" for --${name}. Valid options are: ${nonSeparatorChoices
            .map((c) =>
                c !== null && typeof c === "object" && "value" in c
                    ? String((c as SelectChoice<Value>).value)
                    : String(c),
            )
            .join(", ")}`,
    );
}

export async function confirm(
    config: WithOptionalName<ConfirmConfig>,
): Promise<boolean> {
    const { name, ...rest } = config;

    const cliValue = getCliValue(name);
    if (cliValue === undefined)
        return inquirerConfirm(rest as Parameters<typeof inquirerConfirm>[0]);

    return cliValue === "true";
}

export async function checkbox<Value>(
    config: WithOptionalName<CheckboxConfig<Value>>,
): Promise<Value[]> {
    const { name, ...rest } = config;

    const cliValue = getCliValue(name);
    if (cliValue === undefined)
        return inquirerCheckbox(
            rest as Parameters<typeof inquirerCheckbox>[0],
        ) as Promise<Value[]>;

    const rawItems = cliValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    const nonSeparatorChoices = rest.choices.filter(
        (choice): choice is CheckboxChoice<Value> | string =>
            !(choice instanceof Separator),
    );

    const matched: Value[] = rawItems
        .map((rawItem) => {
            for (const choice of nonSeparatorChoices) {
                if (
                    choice !== null &&
                    typeof choice === "object" &&
                    "value" in choice
                ) {
                    const typed = choice as CheckboxChoice<Value>;
                    if (String(typed.value) === rawItem) {
                        return typed.value;
                    }
                } else if (typeof choice === "string" && choice === rawItem) {
                    return choice as unknown as Value;
                }
            }
            return undefined;
        })
        .filter((value): value is Value => value !== undefined);

    if (rest.validate !== undefined) {
        const matchedAsChoices = matched.map((value) => ({
            value,
        })) as ReadonlyArray<CheckboxChoice<Value>>;
        const validationResult = await rest.validate(matchedAsChoices);
        if (validationResult !== true) {
            const message =
                typeof validationResult === "string"
                    ? validationResult
                    : "Validation failed";
            throw new Error(message);
        }
    }

    return matched;
}

export { Separator };

export const separator = (
    name: string,
    elements: unknown[],
): Separator | undefined => {
    const maybeSeparator = elements.length
        ? new Separator(`-- ${name} --`)
        : undefined;

    return maybeSeparator;
};
