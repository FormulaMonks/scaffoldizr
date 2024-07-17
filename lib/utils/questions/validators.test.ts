import { describe, expect, test } from "bun:test";
import type { StructurizrWorkspace } from "../workspace";
import {
    chainValidators,
    duplicatedSystemName,
    validateDuplicatedElements,
    validateDuplicatedViews,
} from "./validators";

describe("validators", () => {
    describe("chainValidators", () => {
        test("should chain validators correctly", async () => {
            const validate = chainValidators<{
                size?: number;
                weight?: number;
                height?: number;
                test?: string;
            }>(
                (input) => input.length > 0,
                async (input) => input.endsWith("test") || "Error message",
                (input) => input.startsWith("test"),
                (input, answers) => answers?.test === input,
            )({ test: "testtest" });

            const response1 = await validate?.("testtest");
            expect(response1).toBeTrue();
            const response2 = await validate?.("endsWith_test");
            expect(response2).toBeFalse();
            const response3 = await validate?.("testable");
            expect(response3).toEqual("Error message");
            const response4 = await validate?.("");
            expect(response4).toBeFalse();
            const response5 = await validate?.("testtosttest");
            expect(response5).toBeFalse();
        });
    });
    describe("duplicatedSystemName", () => {
        test("should validate if system names are duplicated", () => {
            expect(
                duplicatedSystemName("TestName", {
                    systemName: "test-name",
                }),
            ).toEqual('System name "TestName" already exists');

            expect(
                duplicatedSystemName("Test Name", {
                    systemName: "TestName",
                }),
            ).toEqual('System name "Test Name" already exists');

            expect(
                duplicatedSystemName("Not Duplicated", {
                    systemName: "TestName",
                }),
            ).toEqual(true);
        });
    });

    describe("validateDuplicatedElements", () => {
        test("should validate if elements are duplicated", () => {
            const emptyValidator = validateDuplicatedElements(undefined);
            expect(emptyValidator?.("input")).toEqual(true);

            type SoftwareElement =
                StructurizrWorkspace["model"]["people"][number];
            type SoftwareSystem =
                StructurizrWorkspace["model"]["softwareSystems"][number];

            const loadedValidator = validateDuplicatedElements({
                model: {
                    people: [
                        {
                            id: "123",
                            tags: "Element,Person",
                            name: "SomePerson",
                        },
                    ] as SoftwareElement[],
                    softwareSystems: [
                        {
                            id: "123",
                            tags: "Element,SoftwareSystem",
                            name: "SomeSystem",
                            containers: [
                                {
                                    id: "123",
                                    tags: "Element,Container",
                                    name: "SomeContainer",
                                },
                            ],
                        },
                    ] as SoftwareSystem[],
                    deploymentNodes: [
                        {
                            id: "123",
                            tags: "Element,Deployment Node",
                            name: "Some Deployment Node",
                        },
                    ] as SoftwareElement[],
                },
            } as StructurizrWorkspace);

            expect(loadedValidator?.("SomeSystem")).toEqual(
                `Element with name "SomeSystem" already exists.`,
            );
            expect(loadedValidator?.("some-deployment-node")).toEqual(
                `Element with name "SomeDeploymentNode" already exists.`,
            );
            expect(loadedValidator?.("Some Person")).toEqual(
                `Element with name "SomePerson" already exists.`,
            );
            expect(loadedValidator?.("SomeContainer")).toEqual(
                `Element with name "SomeContainer" already exists.`,
            );
            expect(loadedValidator?.("Not Duplicated")).toEqual(true);
        });
    });
    describe("validateDuplicatedViews", () => {
        test("should validate if views are duplicated", () => {
            const emptyValidator = validateDuplicatedViews(undefined);
            expect(emptyValidator?.("input")).toEqual(true);

            type View =
                StructurizrWorkspace["views"]["systemContextViews"][number];

            const loadedValidator = validateDuplicatedViews({
                views: {
                    systemLandscapeViews: [
                        {
                            key: "Some View",
                        },
                    ] as View[],
                    systemContextViews: [
                        {
                            key: "Some Other View",
                        },
                    ] as View[],
                },
            } as StructurizrWorkspace);

            expect(loadedValidator?.("SomeView")).toEqual(
                'View with name "SomeView" already exists.',
            );
            expect(loadedValidator?.("some-other-view")).toEqual(
                'View with name "SomeOtherView" already exists.',
            );
            expect(loadedValidator?.("Some View")).toEqual(
                'View with name "SomeView" already exists.',
            );
            expect(loadedValidator?.("Not Duplicated")).toEqual(true);
        });
    });
});
