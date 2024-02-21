declare module "*.hbs" {
    const content: string;
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    export default content;
}
