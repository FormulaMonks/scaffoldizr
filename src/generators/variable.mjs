export default () => ({
    description: "Create a new workspace variable",
    prompts: [
        {
            type: "input",
            name: "variableName",
            message: "Variable:",
        },
        {
            type: "input",
            name: "variableValue",
            message: "Value:",
            default: "New Value",
        },
    ],
    actions: [
        {
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Constants/,
            templateFile: "templates/constant.hbs",
        },
    ],
});
