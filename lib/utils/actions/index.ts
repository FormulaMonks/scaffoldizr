export enum ActionTypes {
    Add = "add",
    AddMany = "addMany",
}

export type BaseAction = {
    rootPath: string;
    templates: Map<string, string>;
};

export * from "./add";
export * from "./add-many";
