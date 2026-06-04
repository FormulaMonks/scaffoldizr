import type { AddAction } from "../utils/actions";
import { skipUnlessViewType, whenViewType } from "../utils/actions/utils";
import type { GeneratorDefinition } from "../utils/generator";
import { Elements } from "../utils/labels";
import { input, select } from "../utils/prompts";
import {
    getAllWorkspaceElements,
    resolveSystemQuestion,
} from "../utils/questions/system";
import {
    chainValidators,
    stringEmpty,
    validateDuplicatedViews,
} from "../utils/questions/validators";
import { getWorkspaceJson, getWorkspacePath } from "../utils/workspace";

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
    const dynamicStepFlags = new Map<number, string>();

    const argv = process.argv.slice(2);

    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];

        const match = /^--step-(\d+)(?:=(.*))?$/.exec(argument);
        if (!match) continue;

        const stepNumber = Number(match[1]);
        const inlineValue = match[2];

        if (inlineValue !== undefined) {
            dynamicStepFlags.set(stepNumber, inlineValue);
            continue;
        }

        const nextArgument = argv[index + 1];
        if (nextArgument !== undefined && !nextArgument.startsWith("--")) {
            dynamicStepFlags.set(stepNumber, nextArgument);
            index += 1;
            continue;
        }

        dynamicStepFlags.set(stepNumber, "");
    }

    return [...dynamicStepFlags.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, value]) => value);
}

async function collectDynamicSteps(): Promise<string[]> {
    const stepFlags = getDynamicStepFlags();
    if (stepFlags.length > 0) return stepFlags;

    const dynamicSteps: string[] = [];

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

    for (;;) {
        const sourceElement = await input({
            message: "Source element (e.g., User, WebApplication):",
            validate: stringEmpty,
        });

        const destinationElement = await input({
            message: "Destination element (e.g., API, Database):",
            validate: stringEmpty,
        });

        const relationshipDescription = await input({
            message: "Relationship description (e.g., Visits, Fetches):",
            validate: stringEmpty,
        });

        const technologyChannel = await input({
            message: "Technology/Channel (optional, e.g., JSON/HTTPS, gRPC):",
        });

        const step = assembleRelationship(
            sourceElement,
            destinationElement,
            relationshipDescription,
            technologyChannel,
        );

        if (step.trim().length === 0) break;

        dynamicSteps.push(step);

        const addAnotherStep = await input({
            message:
                "Add another step? (yes/no or press Enter for yes, type 'done'/'no' to stop)",
        });

        const normalizedAddAnotherStep = addAnotherStep.trim().toLowerCase();
        if (
            normalizedAddAnotherStep === "done" ||
            normalizedAddAnotherStep === "no" ||
            normalizedAddAnotherStep === "n"
        ) {
            break;
        }
    }

    return dynamicSteps;
}

function getDynamicScopeChoices(workspaceScope?: string) {
    if (workspaceScope === "softwaresystem") {
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

function getSystemContainerChoices(
    workspaceInfo: Awaited<ReturnType<typeof getWorkspaceJson>>,
    systemName: string,
) {
    const workspaceElements = getAllWorkspaceElements(workspaceInfo, {
        includeContainers: true,
        includeComponents: false,
    });

    return workspaceElements
        .filter(
            (element) =>
                element.systemName === systemName && "containerName" in element,
        )
        .map((element) => ({
            name: element.name,
            value: element.name,
        }));
}

// TODO: Other types of views
// - Dynamic
// - Filtered
// // - System landscape
// // - Deployment
const generator: GeneratorDefinition<ViewAnswers> = {
    name: Elements.View,
    description: "Create a new view",
    questions: async (generator) => {
        const workspaceInfo = await getWorkspaceJson(
            getWorkspacePath(generator.destPath),
        );

        const workspaceScope =
            workspaceInfo?.configuration.scope?.toLowerCase();

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
                ? containerName
                : dynamicScope === "system"
                  ? systemName
                  : undefined;

        const viewName = await input({
            name: "viewName",
            message: "View name:",
            validate: chainValidators(
                stringEmpty,
                validateDuplicatedViews(workspaceInfo),
            )(),
        });

        const viewDescription = await input({
            name: "viewDescription",
            message: "View description:",
            default: "Untitled view",
        });

        const dynamicSteps =
            viewType === "dynamic" ? await collectDynamicSteps() : undefined;

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
            when: whenViewType("landscape"),
            type: "add",
            skipIfExists: true,
            path: "architecture/views/{{kebabCase viewName}}.dsl",
            templateFile: "templates/views/landscape.hbs",
        } as AddAction<ViewAnswers>,
    ],
};

export default generator;
