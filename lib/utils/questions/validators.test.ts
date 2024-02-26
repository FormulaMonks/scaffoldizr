import { describe, expect, test } from "bun:test";
import { chainValidators } from "./validators";

describe("validate", () => {
    describe("chainValidators", () => {
        test("should chain validators correctly", async () => {
            const validate = chainValidators(
                (input) => input.size > 0,
                async (input) => input.weight > 0 || "Error message",
                (input) => input.height > 0,
            );

            const response1 = await validate?.({
                size: 1,
                weight: 1,
                height: 1,
            });
            expect(response1).toBeTrue();
            const response2 = await validate?.({
                size: 1,
                weight: 1,
                height: 0,
            });
            expect(response2).toBeFalse();
            const response3 = await validate?.({
                size: 1,
                weight: 0,
                height: 1,
            });
            expect(response3).toEqual("Error message");
            const response4 = await validate?.({
                size: 0,
                weight: 1,
                height: 1,
            });
            expect(response4).toBeFalse();
        });
    });
});
