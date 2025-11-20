import { afterAll } from "bun:test";
import { rm } from "node:fs/promises";
import { $ } from "bun";

afterAll(async () => {
    const results = await $`find . -name .test-generated`.text();
    for (const result of results.trim().split("\n")) {
        if (!result) continue;
        await rm(result, { recursive: true });
    }
});
