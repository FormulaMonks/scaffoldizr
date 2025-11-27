import chalk from "chalk";
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
export type QuestionsObject<T = string | boolean> = {
    [key: string]: (accumulatedAnswers: Record<string, unknown>) => Promise<T>;
};

export type GeneratorDefinition<
    A extends Record<string, unknown> = Record<string, unknown>,
> = {
    name: string;
    description: string;
    questions: ((generator: Generator<A>) => Promise<A>) | QuestionsObject;
    actions: (AddAction<A> | AddManyAction<A> | AppendAction<A>)[];
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
    action: ExtendedAction &
        (AddAction<A> | AddManyAction<A> | AppendAction<A>),
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
    generator: Generator<A>,
    execute = executeAction,
): Promise<void> {
    console.log(chalk.bold(chalk.gray(generator.description)));

    const answers =
        generator.questions instanceof Function
            ? await generator.questions(generator)
            : ((await Object.entries(
                  generator.questions as QuestionsObject,
              ).reduce(
                  async (answers, [name, prompt]) => {
                      const acc = await answers;

                      const answer = await prompt?.(acc);

                      return {
                          ...acc,
                          [name]: answer,
                      };
                  },
                  Promise.resolve({} as Record<string, unknown>),
              )) as A);

    for await (const action of generator.actions) {
        await execute<A>(
            {
                ...action,
                rootPath: generator.destPath,
                templates: generator.templates,
            },
            answers,
        );
    }
}
