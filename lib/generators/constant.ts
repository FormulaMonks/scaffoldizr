import { AppendAction } from "../utils/actions";
import { GeneratorDeclaration } from "../utils/generator";

type ConstantAnswers = {
    constantName: string;
    constantValue: string;
};

const constantGenerator: GeneratorDeclaration<ConstantAnswers> = {
    name: "Constant",
    description: "Create a new workspace constant",
    prompts: [
        {
            type: "input",
            name: "constantName",
            message: "Constant:",
            validate: (input: string) => input.length > 0,
        },
        {
            type: "input",
            name: "constantValue",
            message: "Value:",
            default: "New Value",
            validate: (input: string) => input.length > 0,
        },
    ],
    actions: [
        {
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Constants/,
            templateFile: "templates/constant.hbs",
        } as AppendAction,
    ],
};

export default constantGenerator;
