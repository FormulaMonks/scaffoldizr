import chalk from "chalk";
import type { Answers, PromptModule, QuestionCollection } from "inquirer";
import type { AddAction, AddManyAction } from "./actions";
import { ActionTypes, add, addMany } from "./actions";

export type Generator<A extends Answers> = {
    description: string;
    prompts: QuestionCollection<A>;
    actions: (AddAction | AddManyAction)[];
    workspacePath: string;
    templates: Map<string, string>;
};

async function executeAction<A extends Answers>(
    action: AddAction | AddManyAction,
    answers: A,
): Promise<boolean> {
    switch (action.type) {
        case ActionTypes.Add: {
            return add(action, answers);
        }
        case ActionTypes.AddMany: {
            return addMany(action, answers);
        }
        default: {
            console.error("Action not found");
            return false;
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
