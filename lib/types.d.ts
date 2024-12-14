declare module "*.hbs" {
    const content: string;

    export default content;
}

declare module "*.gitignore" {
    const content: string;

    export default content;
}

declare module "*.gitattributes" {
    const content: string;

    export default content;
}

declare module "*.sh" {
    const content: string;

    export default content;
}

declare module "*.json" {
    const content: Record<string, unknown>;

    export default content;
}

declare module "*.gitkeep" {
    const content: string;

    export default content;
}
