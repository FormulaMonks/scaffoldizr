import { kebabCase, pascalCase } from "change-case";
import { removeSpaces } from "../handlebars";
import type { StructurizrWorkspace } from "../workspace";
import { getAllWorkspaceElements } from "./system";

type Validator<A extends Record<string, unknown> = Record<string, unknown>> = (
    input: string,
    answers?: A,
) => string | boolean | Promise<string | boolean>;

export const stringEmpty = (input: string) => input?.length > 0;

export const duplicatedSystemName = <A extends { systemName: string }>(
    input: string,
    answers: A | undefined,
) => {
    if (
        answers?.systemName &&
        kebabCase(input) === kebabCase(answers?.systemName)
    ) {
        return `System name "${input}" already exists`;
    }

    return true;
};

export const validateDuplicatedElements =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemElements = getAllWorkspaceElements(workspaceInfo, {
            includeDeploymentNodes: true,
            includeComponents: true,
        }).map((elm) => pascalCase(removeSpaces(elm.name)));
        const elementName = pascalCase(removeSpaces(input));
        if (systemElements.includes(elementName)) {
            return `Element with name "${elementName}" already exists.`;
        }

        return true;
    };

export const validateDuplicatedComponentName =
    (
        workspaceInfo: StructurizrWorkspace | undefined,
        containerName: string,
    ): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemComponents = getAllWorkspaceElements(workspaceInfo, {
            includeContainers: true,
            includeComponents: true,
        })
            .filter((elm) => elm.tags.includes("Component"))
            .map(
                (elm) =>
                    `${pascalCase(removeSpaces(elm.containerName))}_${pascalCase(removeSpaces(elm.name))}`,
            );
        const componentName = `${pascalCase(removeSpaces(containerName))}_${pascalCase(removeSpaces(input))}`;

        if (systemComponents.includes(componentName)) {
            return `Component with name "${componentName}" already exists.`;
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

export function chainValidators<
    A extends Record<string, unknown> = Record<string, unknown>,
>(...validators: Validator<A>[]): (answers?: A) => Validator<A> {
    return (answers = {} as A) =>
        async (input: string) => {
            for await (const validator of validators) {
                const validation = await validator?.(input, answers);
                if (validation !== true) return validation ?? false;
            }

            return true;
        };
}
