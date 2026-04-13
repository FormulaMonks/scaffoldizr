import chalk from "chalk";

export function buildBannerLine(content: string, innerWidth: number): string {
    return (
        chalk.yellow("│  ") + content.padEnd(innerWidth) + chalk.yellow("  │")
    );
}

export function buildBorder(innerWidth: number): string {
    return "─".repeat(innerWidth + 4);
}
