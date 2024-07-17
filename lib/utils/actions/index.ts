export enum ActionTypes {
    Add = "add",
    AddMany = "addMany",
    Append = "append",
}

declare function whenOrSkip<A extends Record<string, unknown>>(
    answers: A,
    rootPath: string,
): boolean | string | Promise<boolean | string>;

export type BaseAction<A extends Record<string, unknown>> = {
    when?: typeof whenOrSkip<A>;
    skip?: typeof whenOrSkip<A>;
};

export type ExtendedAction = {
    rootPath: string;
    templates: Map<string, string>;
};

export * from "./add";
export * from "./add-many";
export * from "./append";
