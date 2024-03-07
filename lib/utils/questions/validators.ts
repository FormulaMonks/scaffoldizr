import { kebabCase, pascalCase } from "change-case";
import type { Answers, Question } from "inquirer";
import { removeSpaces } from "../handlebars";
import type { StructurizrWorkspace } from "../workspace";
import { getAllSystemElements } from "./system";

type Validator = Question["validate"];

export const stringEmpty = (input: string) => input.length > 0;

export const duplicatedSystemName = (input: string, answers: Answers) => {
    if (kebabCase(input) === kebabCase(answers?.systemName)) {
        return `System name "${input}" already exists`;
    }

    return true;
};

export const validateDuplicatedElements =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemElements = getAllSystemElements(workspaceInfo).map((elm) =>
            pascalCase(removeSpaces(elm.name)),
        );
        const elementName = pascalCase(removeSpaces(input));
        if (systemElements.includes(elementName)) {
            return `Element with name "${elementName}" already exists.`;
        }

        return true;
    };

export const validateDuplicatedViews =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemViews = Object.values(workspaceInfo.views)
            .filter((elm) => Array.isArray(elm))
            .flat()
            .map((elm) =>
                pascalCase(
                    removeSpaces(
                        (
                            elm as Exclude<
                                typeof elm,
                                StructurizrWorkspace["configuration"]
                            >
                        ).key,
                    ),
                ),
            );

        const viewName = pascalCase(removeSpaces(input));
        if (systemViews.includes(viewName)) {
            return `View with name "${viewName}" already exists.`;
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
