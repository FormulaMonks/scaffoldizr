import { Elements, elementTypeByTags, labelElementByTags } from "../labels";
import { type Separator, separator } from "../prompts";
import type { getWorkspaceJson, StructurizrWorkspace } from "../workspace";
import { getAllWorkspaceElements } from "./system";

export type ViewElement = {
    id: string;
    name: string;
    tags?: string;
    systemName?: string;
    containerName?: string;
    position?: number;
    properties?: { "structurizr.dsl.identifier"?: string };
    relationships?: { sourceId: string; destinationId: string }[];
};

export type StepElementChoice = {
    name: string;
    value: string;
    _element: ViewElement;
};

export function getSystemContainerChoices(
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
                element.systemName === systemName &&
                elementTypeByTags(element.tags) === Elements.Container,
        )
        .map((element) => ({
            name: element.name,
            value: element.name,
        }));
}

export type DynamicScope = "workspace" | "system" | "container";

export function getDynamicStepElementChoices(
    workspaceInfo: StructurizrWorkspace | undefined,
    dynamicScope: DynamicScope,
    systemName?: string,
    containerName?: string,
): Array<StepElementChoice | Separator> {
    const filteredElements = getAllWorkspaceElements(workspaceInfo, {
        includeContainers: true,
        includeComponents: true,
        includeDeploymentNodes: false,
    }).filter((element) => {
        const elementType = elementTypeByTags(element.tags);

        if (dynamicScope === "workspace") return true;

        if (
            elementType === Elements.Person ||
            elementType === Elements.ExternalSystem
        ) {
            return true;
        }

        if (dynamicScope === "system") {
            if (elementType === Elements.System) {
                return element.name !== systemName;
            }

            if (elementType === Elements.Container) {
                return element.systemName === systemName;
            }

            return false;
        }

        if (dynamicScope === "container") {
            return (
                elementType === Elements.Component &&
                element.systemName === systemName &&
                element.containerName === containerName
            );
        }

        return false;
    });

    const people = filteredElements.filter(
        (el) => elementTypeByTags(el.tags) === Elements.Person,
    );
    const externalSystems = filteredElements.filter(
        (el) => elementTypeByTags(el.tags) === Elements.ExternalSystem,
    );
    const softwareSystems = filteredElements.filter(
        (el) => elementTypeByTags(el.tags) === Elements.System,
    );
    const containers = filteredElements.filter(
        (el) => elementTypeByTags(el.tags) === Elements.Container,
    );
    const components = filteredElements.filter(
        (el) => elementTypeByTags(el.tags) === Elements.Component,
    );

    const mapToChoice = (
        element: (typeof filteredElements)[number],
    ): StepElementChoice => {
        const value =
            element.properties?.["structurizr.dsl.identifier"] ?? element.name;

        const hierarchy = [
            element.systemName,
            element.containerName,
            element.name,
        ]
            .filter(Boolean)
            .join("/");

        return {
            name: `${labelElementByTags(element.tags)} ${hierarchy}`,
            value,
            _element: element as ViewElement,
        };
    };

    const mappedComponents = components.map(mapToChoice);
    const mappedContainers = containers.map(mapToChoice);
    const mappedSoftwareSystems = softwareSystems.map(mapToChoice);
    const mappedExternalSystems = externalSystems.map(mapToChoice);
    const mappedPeople = people.map(mapToChoice);

    return [
        separator("Components", mappedComponents),
        ...mappedComponents,
        separator("Containers", mappedContainers),
        ...mappedContainers,
        separator("Systems", mappedSoftwareSystems),
        ...mappedSoftwareSystems,
        separator("External Systems", mappedExternalSystems),
        ...mappedExternalSystems,
        separator("People", mappedPeople),
        ...mappedPeople,
    ].filter((x): x is StepElementChoice | Separator => x !== undefined);
}

export function getRelationshipsForElement(
    sourceElement: ViewElement,
    candidateElements: ViewElement[],
): ViewElement[] {
    const outgoingPartnerIds = new Set(
        sourceElement.relationships?.map(
            (relationship) => relationship.destinationId,
        ) ?? [],
    );
    return candidateElements.filter((element) =>
        outgoingPartnerIds.has(element.id),
    );
}
