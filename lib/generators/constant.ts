import type { Answers } from "inquirer";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition } from "../utils/generator";
import { stringEmpty } from "../utils/questions/validators";

const generator: GeneratorDefinition<Answers> = {
    name: "Constant",
    description: "Create a new workspace constant",
    questions: [
        {
            type: "input",
            name: "constantName",
            message: "Constant:",
            validate: stringEmpty,
        },
        {
            type: "input",
            name: "constantValue",
            message: "Value:",
            default: "New Value",
            validate: stringEmpty,
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

export default generator;
