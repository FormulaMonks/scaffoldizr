import { describe, expect, mock, test } from "bun:test";
import type { PromptModule } from "inquirer";
import inquirer from "inquirer";
import { StructurizrWorkspace } from "../workspace";
import { getRelationships } from "./relationships";

describe("relationships", () => {
    describe("getRelationships", () => {
        type Model = StructurizrWorkspace["model"];
        type SoftwareElement = Model["people"][number];

        test("should return empty when no workspaceInfo passed", async () => {
            const relationships = await getRelationships(
                "someElement",
                undefined,
                mock() as unknown as PromptModule,
            );

            expect(relationships).toEqual({});
        });
        test("should return empty when no system elements found", async () => {
            const prompt = mock().mockResolvedValue({ relationships: [] });

            const relationships = await getRelationships(
                "someElement",
                {
                    model: {
                        people: [] as SoftwareElement[],
                        softwareSystems: [] as SoftwareElement[],
                        deploymentNodes: [
                            {
                                id: "123",
                                tags: "Element,Deployment Node",
                                name: "SomeDeploymentNode",
                            },
                        ] as SoftwareElement[],
                    },
                } as StructurizrWorkspace,
                prompt as unknown as PromptModule,
            );

            expect(relationships).toEqual({});
            expect(prompt).not.toHaveBeenCalled();
        });

        test("should return empty when no elements flagged for relationship", async () => {
            const prompt = mock().mockResolvedValue({ relationships: [] });

            const relationships = await getRelationships(
                "someElement",
                {
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
                            },
                        ] as SoftwareElement[],
                        deploymentNodes: [
                            {
                                id: "123",
                                tags: "Element,Deployment Node",
                                name: "SomeDeploymentNode",
                            },
                        ] as SoftwareElement[],
                    },
                } as StructurizrWorkspace,
                prompt as unknown as PromptModule,
            );

            expect(prompt).toHaveBeenCalledWith({
                type: "checkbox",
                name: "relationships",
                message: expect.any(String),
                choices: [
                    expect.any(inquirer.Separator),
                    {
                        name: "🔵 SomeSystem",
                        value: "SomeSystem",
                    },
                    expect.any(inquirer.Separator),
                    {
                        name: "👤 SomePerson",
                        value: "SomePerson",
                    },
                ],
                when: expect.any(Function),
            });

            expect(relationships).toEqual({});
        });

        test("should get relationships correctly", async () => {
            const prompt = mock()
                .mockResolvedValueOnce({
                    relationships: ["SomePerson", "SomeSystem"],
                })
                .mockResolvedValueOnce({
                    SomePerson_relationshipType: "outgoing",
                    SomePerson_relationship: "Consumes",
                    SomePerson_technology: "Web/HTTP",
                    SomeSystem_relationshipType: "outgoing",
                    SomeSystem_relationship: "Consumes",
                    SomeSystem_technology: "Web/HTTP",
                });

            const relationships = await getRelationships(
                "someElement",
                {
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
                            },
                        ] as SoftwareElement[],
                        deploymentNodes: [
                            {
                                id: "123",
                                tags: "Element,Deployment Node",
                                name: "SomeDeploymentNode",
                            },
                        ] as SoftwareElement[],
                    },
                } as StructurizrWorkspace,
                prompt as unknown as PromptModule,
            );

            expect(prompt).toHaveBeenCalledTimes(2);
            expect(prompt).toHaveBeenLastCalledWith([
                {
                    type: "list",
                    name: "SomePerson_relationshipType",
                    message: expect.any(String),
                    choices: expect.any(Array),
                    default: expect.any(String),
                },
                {
                    type: "input",
                    name: "SomePerson_relationship",
                    message: expect.any(String),
                    default: expect.any(String),
                },
                {
                    type: "input",
                    name: "SomePerson_technology",
                    message: expect.any(String),
                    default: expect.any(String),
                },
                {
                    type: "list",
                    name: "SomeSystem_relationshipType",
                    message: expect.any(String),
                    choices: expect.any(Array),
                    default: expect.any(String),
                },
                {
                    type: "input",
                    name: "SomeSystem_relationship",
                    message: expect.any(String),
                    default: expect.any(String),
                },
                {
                    type: "input",
                    name: "SomeSystem_technology",
                    message: expect.any(String),
                    default: expect.any(String),
                },
            ]);

            expect(relationships).toEqual({
                SomePerson: {
                    relationshipType: "outgoing",
                    relationship: "Consumes",
                    technology: "Web/HTTP",
                },
                SomeSystem: {
                    relationshipType: "outgoing",
                    relationship: "Consumes",
                    technology: "Web/HTTP",
                },
            });
        });
    });
});
