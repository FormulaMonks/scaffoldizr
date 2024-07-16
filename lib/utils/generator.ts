import type { CancelablePromise } from "@inquirer/type";
import chalk from "chalk";
import type { PromptModule, QuestionCollection } from "inquirer";
import type {
    AddAction,
    AddManyAction,
    AppendAction,
    ExtendedAction,
} from "./actions";
import { ActionTypes, add, addMany, append } from "./actions";

/**
 * Added support for latest inquirer API
 */
export type QuestionsObject = {
    [key: string]: () => CancelablePromise<string | boolean>;
};

export type GeneratorDefinition<
    A extends Record<string, unknown> = Record<string, unknown>,
> = {
    name: string;
    description: string;
    questions:
        | QuestionCollection<A>
        | ((prompt: PromptModule, generator: Generator<A>) => Promise<A>)
        | QuestionsObject;
    actions: (AddAction | AddManyAction | AppendAction)[];
};

export type Generator<A extends Record<string, unknown>> =
    GeneratorDefinition<A> & {
        destPath: string;
        templates: Map<string, string>;
    };

export type GetAnswers<Type> = Type extends GeneratorDefinition<infer X>
    ? X
    : null;

async function executeAction<A extends Record<string, unknown>>(
    action: ExtendedAction & (AddAction | AddManyAction | AppendAction),
    answers: A,
): Promise<boolean> {
    switch (action.type) {
        case ActionTypes.Add: {
            return add(action, answers);
        }
        case ActionTypes.AddMany: {
            return addMany(action, answers);
        }
        case ActionTypes.Append: {
            return append(action, answers);
        }
        default: {
            throw new Error("Action not found");
        }
    }
}

export async function createGenerator<A extends Record<string, unknown>>(
    prompt: PromptModule,
    generator: Generator<A>,
    execute = executeAction,
): Promise<void> {
    console.log(chalk.bold(chalk.gray(generator.description)));
    // const sleep = (n: number) => new Promise((res) => setTimeout(res, n));
    const answers =
        generator.questions instanceof Function
            ? await generator.questions(prompt, generator)
            : Array.isArray(generator.questions)
              ? await prompt(generator.questions)
              : await Object.entries(
                    generator.questions as QuestionsObject,
                ).reduce(
                    async (answers, [name, prompt]) => {
                        const acc = await answers;

                        const answer = await prompt?.();

                        return {
                            ...acc,
                            [name]: answer,
                        };
                    },
                    Promise.resolve({} as Record<string, unknown>),
                );

    for await (const action of generator.actions) {
        await execute(
            {
                ...action,
                rootPath: generator.destPath,
                templates: generator.templates,
            },
            answers,
        );
    }
}
