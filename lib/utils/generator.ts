import chalk from "chalk";
import type { Answers, PromptModule, QuestionCollection } from "inquirer";
import type { AddAction, AddManyAction, AppendAction } from "./actions";
import { ActionTypes, add, addMany, append } from "./actions";

export type GeneratorDeclaration<A extends Answers> = {
    name: string;
    description: string;
    prompts: QuestionCollection<A>;
    actions: (AddAction | AddManyAction | AppendAction)[];
};

export type Generator<A extends Answers> = GeneratorDeclaration<A> & {
    workspacePath: string;
    templates: Map<string, string>;
};

export type GetAnswers<Type> = Type extends GeneratorDeclaration<infer X>
    ? X
    : null;

async function executeAction<A extends Answers>(
    action: AddAction | AddManyAction | AppendAction,
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

export async function createGenerator<A extends Answers>(
    prompt: PromptModule,
    generator: Generator<A>,
): Promise<void> {
    console.log(chalk.bold(chalk.gray(generator.description)));
    const answers = await prompt(generator.prompts);

    await Promise.all(
        generator.actions.map((action) =>
            executeAction(
                {
                    ...action,
                    rootPath: generator.workspacePath,
                    templates: generator.templates,
                },
                answers,
            ),
        ),
    );
}
