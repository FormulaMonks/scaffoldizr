declare module "*.hbs" {
    const content: string;
    // biome-ignore lint/correctness/noUndeclaredVariables: Ignore known file extensions
    export default content;
}

declare module "*.gitignore" {
    const content: string;
    // biome-ignore lint/correctness/noUndeclaredVariables: Ignore known file extensions
    export default content;
}

declare module "*.sh" {
    const content: string;
    // biome-ignore lint/correctness/noUndeclaredVariables: Ignore known file extensions
    export default content;
}

declare module "*.json" {
    const content: Record<string, unknown>;
    // biome-ignore lint/correctness/noUndeclaredVariables: Ignore known file extensions
    export default content;
}

declare module "*.gitkeep" {
    const content: string;
    // biome-ignore lint/correctness/noUndeclaredVariables: Ignore known file extensions
    export default content;
}
