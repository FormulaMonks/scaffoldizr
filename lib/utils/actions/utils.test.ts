import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { file, write } from "bun";
import { removeGitkeep } from "./utils";

describe("actions", () => {
    describe("utils", () => {
        test("should remove .gitkeep when present", async () => {
            const rootPath = resolve(import.meta.dirname, ".test-generated");
            const testDir = resolve(rootPath, "utils-test");
            const gitkeepPath = resolve(testDir, ".gitkeep");

            // Create directory and .gitkeep file
            await write(gitkeepPath, "");

            expect(await file(gitkeepPath).exists()).toBe(true);

            await removeGitkeep(testDir, rootPath);

            expect(await file(gitkeepPath).exists()).toBe(false);
        });

        test("should remove .gitkeep from all ancestor directories up to rootPath", async () => {
            const rootPath = resolve(import.meta.dirname, ".test-generated");
            const subdir = resolve(rootPath, "ancestor-test/subdir");
            const gitkeepRoot = resolve(rootPath, "ancestor-test/.gitkeep");
            const gitkeepSubdir = resolve(subdir, ".gitkeep");

            // Create .gitkeep files in root and subdir
            await write(gitkeepRoot, "");
            await write(gitkeepSubdir, "");

            expect(await file(gitkeepRoot).exists()).toBe(true);
            expect(await file(gitkeepSubdir).exists()).toBe(true);

            await removeGitkeep(subdir, rootPath);

            // Both should be removed
            expect(await file(gitkeepRoot).exists()).toBe(false);
            expect(await file(gitkeepSubdir).exists()).toBe(false);
        });

        test("should not throw when removing .gitkeep concurrently", async () => {
            const rootPath = resolve(import.meta.dirname, ".test-generated");
            const concurrentDir = resolve(rootPath, "concurrent-test");
            const gitkeepPath = resolve(concurrentDir, ".gitkeep");

            await write(gitkeepPath, "");
            expect(await file(gitkeepPath).exists()).toBe(true);

            await Promise.all([
                removeGitkeep(concurrentDir, rootPath),
                removeGitkeep(concurrentDir, rootPath),
            ]);

            expect(await file(gitkeepPath).exists()).toBe(false);
        });
    });
});
