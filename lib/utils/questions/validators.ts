import { kebabCase, pascalCase } from "change-case";
import type { Answers, Question } from "inquirer";
import type { StructurizrWorkspace } from "../workspace";

type Validator = Question["validate"];

export const stringEmpty = (input: string) => input.length > 0;

export const duplicatedSystemName = (input: string, answers: Answers) => {
    if (kebabCase(input) === kebabCase(answers?.systemName)) {
        return `System name "${input}" already exists`;
    }

    return true;
};

export const validateDuplicates =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemElements = Object.values(workspaceInfo.model)
            .flat()
            .map((elm) => elm.name);

        const elementName = pascalCase(input.replace(/\s/g, ""));
        if (systemElements.includes(elementName)) {
            return `Element with name "${elementName}" already exists.`;
        }

        return true;
    };

export function chainValidators(...validators: Validator[]): Validator {
    return async (input: unknown, answers?: Answers | undefined) => {
        for await (const validator of validators) {
            const validation = await validator?.(input, answers);
            if (validation !== true) return validation ?? false;
        }

        return true;
    };
}
