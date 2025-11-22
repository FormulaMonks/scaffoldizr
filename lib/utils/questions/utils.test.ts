import { describe, expect, it } from "bun:test";
import { Separator } from "@inquirer/prompts";
import { separator } from "./utils";

describe("separator", () => {
    it("returns a Separator instance when elements are present", () => {
        const createdSeparator = separator("Group", [
            { name: "Item1", value: 1 },
        ]);
        expect(createdSeparator).toBeInstanceOf(Separator);
    });

    it("returns undefined when elements array is empty", () => {
        const createdSeparator = separator("EmptyGroup", []);
        expect(createdSeparator).toBeUndefined();
    });
});
