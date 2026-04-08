import {
    afterEach,
    beforeEach,
    describe,
    expect,
    mock,
    spyOn,
    test,
} from "bun:test";

describe("prompts", () => {
    const originalArgv = process.argv;

    beforeEach(async () => {
        process.argv = ["bun", "scfz"];
        const { resetArgvCache } = await import("./prompts");
        resetArgvCache();
    });

    afterEach(() => {
        process.argv = originalArgv;
    });

    describe("input", () => {
        test("bypasses prompt when matching CLI arg is provided", async () => {
            process.argv = ["bun", "scfz", "--workspaceName=MyWorkspace"];

            const { input } = await import("./prompts");
            const result = await input({
                message: "Workspace name:",
                name: "workspaceName",
            });

            expect(result).toBe("MyWorkspace");
        });

        test("bypasses prompt using space-separated arg", async () => {
            process.argv = ["bun", "scfz", "--workspaceName", "MyWorkspace"];

            const { input } = await import("./prompts");
            const result = await input({
                message: "Workspace name:",
                name: "workspaceName",
            });

            expect(result).toBe("MyWorkspace");
        });

        test("runs validation on non-interactive value and throws on failure", async () => {
            process.argv = ["bun", "scfz", "--systemName=InvalidName"];

            const { input } = await import("./prompts");
            const validate = mock(
                (_value: string) => "Element with name already exists.",
            );

            await expect(
                input({
                    message: "System Name:",
                    name: "systemName",
                    validate,
                }),
            ).rejects.toThrow("Element with name already exists.");

            expect(validate).toHaveBeenCalledWith("InvalidName");
        });

        test("does not throw when validation returns true", async () => {
            process.argv = ["bun", "scfz", "--systemName=ValidName"];

            const { input } = await import("./prompts");
            const validate = mock((_value: string) => true as const);

            const result = await input({
                message: "System Name:",
                name: "systemName",
                validate,
            });

            expect(result).toBe("ValidName");
            expect(validate).toHaveBeenCalledWith("ValidName");
        });

        test("falls back to interactive when no matching arg provided", async () => {
            process.argv = ["bun", "scfz"];

            const inquirerPrompts = await import("@inquirer/prompts");
            const inputSpy = spyOn(inquirerPrompts, "input").mockResolvedValue(
                "InteractiveAnswer",
            );

            const { input } = await import("./prompts");
            const result = await input({
                message: "Workspace name:",
                name: "workspaceName",
            });

            expect(result).toBe("InteractiveAnswer");
            expect(inputSpy).toHaveBeenCalled();

            inputSpy.mockRestore();
        });

        test("falls back to interactive when no name provided in config", async () => {
            process.argv = ["bun", "scfz", "--workspaceName=MyWorkspace"];

            const inquirerPrompts = await import("@inquirer/prompts");
            const inputSpy = spyOn(inquirerPrompts, "input").mockResolvedValue(
                "InteractiveAnswer",
            );

            const { input } = await import("./prompts");
            const result = await input({
                message: "Workspace name:",
            });

            expect(result).toBe("InteractiveAnswer");
            expect(inputSpy).toHaveBeenCalled();

            inputSpy.mockRestore();
        });
    });

    describe("select", () => {
        test("bypasses prompt and returns matching choice value", async () => {
            process.argv = ["bun", "scfz", "--scope=softwaresystem"];

            const { select } = await import("./prompts");
            const result = await select({
                message: "Workspace scope:",
                name: "scope",
                choices: [
                    { name: "Software System", value: "softwaresystem" },
                    { name: "Landscape", value: "landscape" },
                ],
            });

            expect(result).toBe("softwaresystem");
        });

        test("falls back to interactive when arg not provided", async () => {
            process.argv = ["bun", "scfz"];

            const inquirerPrompts = await import("@inquirer/prompts");
            const selectSpy = spyOn(
                inquirerPrompts,
                "select",
            ).mockResolvedValue("landscape");

            const { select } = await import("./prompts");
            const result = await select({
                message: "Workspace scope:",
                name: "scope",
                choices: [
                    { name: "Software System", value: "softwaresystem" },
                    { name: "Landscape", value: "landscape" },
                ],
            });

            expect(result).toBe("landscape");
            expect(selectSpy).toHaveBeenCalled();

            selectSpy.mockRestore();
        });
    });

    describe("confirm", () => {
        test("returns true when CLI arg is 'true'", async () => {
            process.argv = ["bun", "scfz", "--includeTheme=true"];

            const { confirm } = await import("./prompts");
            const result = await confirm({
                message: "Include default theme?",
                name: "includeTheme",
            });

            expect(result).toBe(true);
        });

        test("returns false when CLI arg is 'false'", async () => {
            process.argv = ["bun", "scfz", "--includeTheme=false"];

            const { confirm } = await import("./prompts");
            const result = await confirm({
                message: "Include default theme?",
                name: "includeTheme",
            });

            expect(result).toBe(false);
        });

        test("falls back to interactive when no arg provided", async () => {
            process.argv = ["bun", "scfz"];

            const inquirerPrompts = await import("@inquirer/prompts");
            const confirmSpy = spyOn(
                inquirerPrompts,
                "confirm",
            ).mockResolvedValue(true);

            const { confirm } = await import("./prompts");
            const result = await confirm({
                message: "Include default theme?",
                name: "includeTheme",
            });

            expect(result).toBe(true);
            expect(confirmSpy).toHaveBeenCalled();

            confirmSpy.mockRestore();
        });
    });

    describe("checkbox", () => {
        test("bypasses prompt and returns matched choice values", async () => {
            const url1 = "https://example.com/shapes.json";
            const url2 = "https://example.com/status.json";

            process.argv = ["bun", "scfz", `--themes=${url1},${url2}`];

            const { checkbox } = await import("./prompts");
            const result = await checkbox({
                message: "Select themes:",
                name: "themes",
                choices: [
                    { name: "Shapes", value: url1 },
                    { name: "Status", value: url2 },
                ],
            });

            expect(result).toEqual([url1, url2]);
        });

        test("falls back to interactive when no arg provided", async () => {
            process.argv = ["bun", "scfz"];

            const inquirerPrompts = await import("@inquirer/prompts");
            const checkboxSpy = spyOn(
                inquirerPrompts,
                "checkbox",
            ).mockResolvedValue(["value1"]);

            const { checkbox } = await import("./prompts");
            const result = await checkbox({
                message: "Select themes:",
                name: "themes",
                choices: [{ name: "Option 1", value: "value1" }],
            });

            expect(result).toEqual(["value1"]);
            expect(checkboxSpy).toHaveBeenCalled();

            checkboxSpy.mockRestore();
        });
    });

    describe("validation with async validators", () => {
        test("handles async validation that returns a failure string", async () => {
            process.argv = ["bun", "scfz", "--elementName=ExistingElement"];

            const { input } = await import("./prompts");
            const validate = mock(async (_value: string) => {
                return 'Element with name "ExistingElement" already exists.';
            });

            await expect(
                input({
                    message: "Element Name:",
                    name: "elementName",
                    validate,
                }),
            ).rejects.toThrow(
                'Element with name "ExistingElement" already exists.',
            );
        });

        test("handles async validation that returns true", async () => {
            process.argv = ["bun", "scfz", "--elementName=NewElement"];

            const { input } = await import("./prompts");
            const validate = mock(async (_value: string) => true as const);

            const result = await input({
                message: "Element Name:",
                name: "elementName",
                validate,
            });

            expect(result).toBe("NewElement");
        });
    });

    describe("separator", () => {
        test("returns a Separator instance when elements are present", async () => {
            const { separator, Separator } = await import("./prompts");
            const createdSeparator = separator("Group", [
                { name: "Item1", value: 1 },
            ]);
            expect(createdSeparator).toBeInstanceOf(Separator);
        });

        test("returns undefined when elements array is empty", async () => {
            const { separator } = await import("./prompts");
            const createdSeparator = separator("EmptyGroup", []);
            expect(createdSeparator).toBeUndefined();
        });
    });
});
