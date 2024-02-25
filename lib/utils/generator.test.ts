import { describe, expect, mock, test } from "bun:test";
import type { PromptModule } from "inquirer";
import templates from "../templates/bundle";
import { AddAction } from "./actions";
import { Generator, createGenerator } from "./generator";

describe("generator", () => {
    describe("createGenerator", () => {
        test("should create generator and execute actions", async () => {
            const prompt = mock(() => Promise.resolve({ answer: 123 }));
            const execute = mock();
            const questions = [{ type: "input", name: "question" }];
            const actions = [{ type: "add" } as AddAction];

            const definition: Generator<{ answer: string }> = {
                name: "Test",
                description: "Test Generator",
                destPath: `${import.meta.dirname}/workspace.dsl`,
                templates,
                questions,
                actions,
            };

            expect(
                async () =>
                    await createGenerator(
                        prompt as unknown as PromptModule,
                        definition,
                        execute,
                    ),
            ).not.toThrow();

            expect(prompt).toHaveBeenCalledWith(questions);
            expect(execute).toHaveBeenCalled();
            expect(execute.mock.lastCall).toEqual([
                expect.objectContaining({
                    ...actions[0],
                }),
                { answer: 123 },
            ]);
        });

        test("should create generator from function questions", async () => {
            const prompt = mock(() => Promise.resolve({ answer: 123 }));
            const execute = mock();
            const questionsArr = [{ type: "input", name: "question" }];
            const questions = (
                promptMock: (
                    questions: unknown[],
                ) => Promise<{ answer: string }>,
            ) => {
                return promptMock(questionsArr);
            };
            const actions = [{ type: "add" } as AddAction];

            const definition: Generator<{ answer: string }> = {
                name: "Test",
                description: "Test Generator",
                destPath: `${import.meta.dirname}/workspace.dsl`,
                templates,
                questions,
                actions,
            };

            expect(
                async () =>
                    await createGenerator(
                        prompt as unknown as PromptModule,
                        definition,
                        execute,
                    ),
            ).not.toThrow();

            expect(prompt).toHaveBeenCalledWith(questionsArr);
            expect(execute).toHaveBeenCalled();
            expect(execute.mock.lastCall).toEqual([
                expect.objectContaining({
                    ...actions[0],
                }),
                { answer: 123 },
            ]);
        });
    });
});
