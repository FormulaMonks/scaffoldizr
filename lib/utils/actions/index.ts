import type { Answers } from "inquirer";

export enum ActionTypes {
    Add = "add",
    AddMany = "addMany",
    Append = "append",
}

declare function whenOrSkip<A extends Answers>(
    answers: A,
    rootPath: string,
): boolean | string;

export type BaseAction = {
    rootPath: string;
    templates: Map<string, string>;
    when?: typeof whenOrSkip;
    skip?: typeof whenOrSkip;
};

export * from "./add";
export * from "./add-many";
export * from "./append";
