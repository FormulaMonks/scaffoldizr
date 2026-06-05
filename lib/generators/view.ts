import type { AddAction } from "../utils/actions";
import { skipUnlessViewType, whenViewType } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { confirm, input, Separator, select } from "../utils/prompts";
import {
    getAllWorkspaceElements,
    resolveSystemQuestion,
} from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedViewFile,
    validateDuplicatedViews,
} from "../utils/questions/validators";
import {
    type DynamicScope,
    getDynamicStepElementChoices,
    getRelationshipsForElement,
    getSystemContainerChoices,
    type ViewElement,
} from "../utils/questions/view";
import type { StructurizrWorkspace } from "../utils/workspace";
import {
    getWorkspaceDslScope,
    getWorkspaceJson,
    getWorkspacePath,
    normalizeWorkspaceScope,
} from "../utils/workspace";

type ChoiceItem = { name: string; value: string; _element: ViewElement };

type ViewAnswers = {
    viewType: string;
    dynamicScope?: string;
    dynamicScopeType?: string;
    dynamicScopeElement?: string;
    dynamicSteps?: string[];
    viewName: string;
    viewDescription: string;
    systemName?: string;
    containerName?: string;
    instanceDescription?: string;
};

function getDynamicStepFlags(): string[] {
    const dynamicStepFlags: Array<[number, string]> = [];

    const argv = process.argv.slice(2);

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        const match = /^--step-(\d+)(?:=(.*))?$/.exec(argument);
        if (!match) continue;

        const stepNumber = Number(match[1]);
        const inlineValue = match[2];

        if (inlineValue !== undefined) {
            dynamicStepFlags.push([stepNumber, inlineValue]);
            continue;
        }

        const nextArgument = argv[index + 1];
        if (nextArgument !== undefined && !nextArgument.startsWith("--")) {
            dynamicStepFlags.push([stepNumber, nextArgument]);
            index += 1;
            continue;
        }

        dynamicStepFlags.push([stepNumber, ""]);
    }

    return dynamicStepFlags
        .sort(([left], [right]) => left - right)
        .map(([stepNum, value]) => `${stepNum}: ${value}`);
}

function getDslIdentifier(
    workspaceInfo: StructurizrWorkspace | undefined,
    elementName: string,
): string {
    const allElements = getAllWorkspaceElements(workspaceInfo, {
        includeContainers: true,
        includeComponents: false,
    });
    const element = allElements.find(
        (workspaceElement) => workspaceElement.name === elementName,
    );
    return element?.properties?.["structurizr.dsl.identifier"] ?? elementName;
}

async function collectDynamicSteps(
    workspaceInfo: StructurizrWorkspace | undefined,
    dynamicScope: DynamicScope,
    systemName?: string,
    containerName?: string,
): Promise<string[]> {
    const stepFlags = getDynamicStepFlags();
    if (stepFlags.length > 0) return stepFlags;

    const dynamicStepElements = getDynamicStepElementChoices(
        workspaceInfo,
        dynamicScope,
        systemName,
        containerName,
    );

    const nonSeparatorElements = dynamicStepElements.filter(
        (el): el is ChoiceItem => !(el instanceof Separator),
    );

    if (nonSeparatorElements.length === 0) {
        throw new Error(
            "No elements available for the selected dynamic scope.",
        );
    }

    const dynamicSteps: string[] = [];
    let lastUsedPosition = 0;

    const normalizeRelationshipPart = (value: string) => value.trim();

    const assembleRelationship = (
        sourceElement: string,
        destinationElement: string,
        relationshipDescription: string,
        technologyChannel: string,
    ) => {
        const relationshipParts = [
            `${normalizeRelationshipPart(sourceElement)} -> ${normalizeRelationshipPart(destinationElement)}`,
            `"${normalizeRelationshipPart(relationshipDescription)}"`,
        ];

        const normalizedTechnologyChannel =
            normalizeRelationshipPart(technologyChannel);

        if (normalizedTechnologyChannel.length > 0) {
            relationshipParts.push(`"${normalizedTechnologyChannel}"`);
        }

        return relationshipParts.join(" ");
    };

    while (true) {
        const sourceElementKey = await select<string>({
            name: "sourceElement",
            message: "Source element:",
            choices: dynamicStepElements,
        });

        const selectedSourceElement = nonSeparatorElements.find(
            (element) => element.value === sourceElementKey,
        );

        if (!selectedSourceElement) {
            throw new Error(
                "Selected source element was not found in workspace.",
            );
        }

        const relatedElements = getRelationshipsForElement(
            selectedSourceElement._element,
            nonSeparatorElements.map(({ _element }) => _element),
        );
        const relatedElementIds = new Set(relatedElements.map(({ id }) => id));
        const destinationChoices: Array<(typeof dynamicStepElements)[number]> =
            [];
        let currentGroupSeparator: Separator | undefined;
        const currentGroupItems: Array<(typeof dynamicStepElements)[number]> =
            [];

        const flushGroup = (): void => {
            if (currentGroupItems.length === 0) return;

            if (currentGroupSeparator !== undefined) {
                destinationChoices.push(
                    currentGroupSeparator,
                    ...currentGroupItems,
                );
            } else {
                destinationChoices.push(...currentGroupItems);
            }

            currentGroupSeparator = undefined;
            currentGroupItems.length = 0;
        };

        for (const item of dynamicStepElements) {
            if (item instanceof Separator) {
                flushGroup();
                currentGroupSeparator = item;
                continue;
            }

            if (relatedElementIds.has(item._element.id)) {
                currentGroupItems.push(item);
            }
        }

        flushGroup();

        if (destinationChoices.length === 0) {
            console.log(
                "No valid destination elements found for the selected source. Exiting.",
            );
            break;
        }

        const destinationElementKey = await select<string>({
            name: "destinationElement",
            message: "Destination element:",
            choices: destinationChoices,
        });

        const selectedDestinationElement = nonSeparatorElements.find(
            (element) => element.value === destinationElementKey,
        );

        if (!selectedDestinationElement) {
            throw new Error(
                "Selected destination element was not found in workspace.",
            );
        }

        const relationshipDescription = await input({
            message: "Relationship description (e.g., Visits, Fetches):",
            validate: stringEmpty,
        });

        const technologyChannel = await input({
            message: "Technology/Channel (optional, e.g., JSON/HTTPS, gRPC):",
        });

        const suggestedPosition = lastUsedPosition + 1;
        const positionInput = await input({
            message: `Step position (default: ${suggestedPosition}):`,
        });
        const stepPosition =
            positionInput.trim() === "" ||
            Number.isNaN(Number(positionInput.trim()))
                ? suggestedPosition
                : Number(positionInput.trim());
        lastUsedPosition = stepPosition;

        const step = assembleRelationship(
            selectedSourceElement.value,
            selectedDestinationElement.value,
            relationshipDescription,
            technologyChannel,
        );

        if (step.trim().length === 0) break;

        dynamicSteps.push(`${stepPosition}: ${step}`);

        const addAnotherStep = await confirm({
            message: "Add another step?",
            default: true,
        });

        if (!addAnotherStep) break;
    }

    return dynamicSteps;
}

function getDynamicScopeChoices(workspaceScope?: string) {
    if (workspaceScope === "SoftwareSystem") {
        return [
            { name: "System", value: "system" },
            { name: "Container", value: "container" },
        ];
    }

    return [
        { name: "Workspace", value: "workspace" },
        { name: "System", value: "system" },
    ];
}

// TODO: Other types of views
// - Filtered
// // - Dynamic
// // - System landscape
// // - Deployment
const generator: GeneratorDefinition<ViewAnswers> = {
    name: Elements.View,
    description: "Create a new view",
    questions: async (generator) => {
        const workspaceFolder = getWorkspacePath(generator.destPath);
        const workspaceInfo = await getWorkspaceJson(workspaceFolder);

        const workspaceScope =
            normalizeWorkspaceScope(workspaceInfo?.configuration.scope) ??
            (await getWorkspaceDslScope(workspaceFolder));

        const viewType = await select<string>({
            name: "viewType",
            message: "View type:",
            choices: [
                { name: "Dynamic", value: "dynamic" },
                // "filtered",
                { name: "Deployment", value: "deployment" },
                { name: "Landscape", value: "landscape" },
            ],
        });

        const dynamicScope =
            viewType === "dynamic"
                ? await select<string>({
                      name: "dynamicScope",
                      message: "Dynamic scope:",
                      choices: getDynamicScopeChoices(workspaceScope),
                  })
                : undefined;

        const systemName =
            viewType !== "landscape" && dynamicScope !== "workspace"
                ? await resolveSystemQuestion(
                      workspaceInfo ?? generator.destPath,
                  )
                : undefined;

        const containerName =
            viewType === "dynamic" && dynamicScope === "container"
                ? await select<string>({
                      name: "containerName",
                      message: "Container:",
                      choices: getSystemContainerChoices(
                          workspaceInfo,
                          systemName ?? "",
                      ),
                  })
                : undefined;

        const dynamicScopeElement =
            dynamicScope === "container"
                ? getDslIdentifier(workspaceInfo, containerName ?? "")
                : dynamicScope === "system"
                  ? getDslIdentifier(workspaceInfo, systemName ?? "")
                  : undefined;

        const viewName = await input({
            name: "viewName",
            message: "View name:",
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedViews(workspaceInfo),
                validateDuplicatedViewFile(workspaceFolder),
            )(),
        });

        const viewDescription = await input({
            name: "viewDescription",
            message: "View description:",
            default: "Untitled view",
        });

        const dynamicSteps =
            viewType === "dynamic"
                ? await collectDynamicSteps(
                      workspaceInfo,
                      (dynamicScope as DynamicScope) ?? "workspace",
                      systemName,
                      containerName,
                  )
                : undefined;

        const instanceDescription =
            viewType === "deployment"
                ? await input({
                      name: "instanceDescription",
                      message: "System Instance description:",
                      default: "System instance",
                  })
                : undefined;

        // TODO: For deployment views return system technologies to set in the template

        return {
            viewType,
            dynamicScope,
            dynamicScopeType: dynamicScope,
            dynamicScopeElement,
            dynamicSteps,
            viewName,
            viewDescription,
            systemName,
            containerName,
            instanceDescription,
        };
    },
    actions: [
        {
            skip: skipUnlessViewType("dynamic"),
            type: "add",
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/dynamic.hbs",
        } as AddAction<ViewAnswers>,
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/deployment.hbs",
        } as AddAction<ViewAnswers>,
        {
            skip: skipUnlessViewType("deployment"),
            type: "add",
            path: "architecture/environments/{{kebabCase viewName}}.dsl",
            templateFile: "templates/environments/deployment.hbs",
        } as AddAction<ViewAnswers>,
        {
            skip: skipUnlessViewType("landscape"),
            type: "add",
            skipIfExists: true,
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/landscape.hbs",
        } as AddAction<ViewAnswers>,
    ],
};

export default generator;
