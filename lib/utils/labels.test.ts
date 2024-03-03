import { describe, expect, test } from "bun:test";
import { Labels, labelElementByName, labelElementByTags } from "./labels";

describe("labels", () => {
    describe("labelElementByTags", () => {
        test("should label elements correctly", () => {
            expect(labelElementByTags("External,System")).toEqual(
                Labels.External,
            );
            expect(labelElementByTags("System,Person")).toEqual(Labels.Person);
            expect(labelElementByTags("System,Container")).toEqual(
                Labels.Container,
            );
            expect(labelElementByTags("DoesNotExist")).toEqual(Labels.System);
        });
    });
    describe("labelElementsByName", () => {
        test("should label elements correctly", () => {
            expect(labelElementByName("External System")).toEqual(
                Labels.External,
            );
            expect(labelElementByName("Person")).toEqual(Labels.Person);
            expect(labelElementByName("System")).toEqual(Labels.System);
            expect(labelElementByName("Container")).toEqual(Labels.Container);
            expect(labelElementByName("View")).toEqual(Labels.View);
            expect(labelElementByName("Constant")).toEqual(Labels.Constant);
            expect(labelElementByName("Relationship")).toEqual(
                Labels.Relationship,
            );
            expect(labelElementByName("DoesNotExist")).toEqual(Labels.System);
        });
    });
});
