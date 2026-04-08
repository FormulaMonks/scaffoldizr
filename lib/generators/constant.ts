import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition, QuestionsObject } from "../utils/generator";
import { Elements } from "../utils/labels";
import { input } from "../utils/prompts";
import { stringEmpty } from "../utils/questions/validators";

type ConstantAnswers = {
    constantName: string;
    constantValue: string;
};

const generator: GeneratorDefinition<ConstantAnswers> = {
    name: Elements.Constant,
    description: "Create a new workspace constant",
    questions: {
        constantName: () =>
            input({
                name: "constantName",
                message: "Constant:",
                required: true,
                validate: stringEmpty,
            }),
        constantValue: () =>
            input({
                name: "constantValue",
                message: "Value:",
                default: "New Value",
                required: true,
                validate: stringEmpty,
            }),
    } as QuestionsObject,
    actions: [
        {
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Constants/,
            templateFile: "templates/constant.hbs",
        } as AppendAction<ConstantAnswers>,
    ],
};

export default generator;
