# Constant

## What is a constant?

The `!const` keyword can be used to define a constant. Check the [documentation](https://docs.structurizr.com/dsl/basics#string-constants-and-variables) for further details.

## Create a constant

1. Constants do not have a file of its own, but should be defined under the `./architecture/workspace.dsl` file. There is a comment `# Constants`. Each new constant has to be placed after the last available constant and before `archetypes` entry.
2. A constant notation is written in the following format: `!const {CONST_NAME} "{description}"` where:

    - `{CONST_NAME}` is the name of the constant. Use all caps and underscore format. Keep it concise.
    - `{description}` is the name of the constant.

## Usage examples

- E.g. `!const WEB "Web/Browser"`
- Whenever a term has been repeated multiple times, a constant can be defined to represent that field. E.g.

    ```dsl
    TestContainer = container "TestContainer" {
        technology "${WEB}"
    }
    ```

⚠️ **IMPORTANT** ⚠️ Make sure whenever using a constant to use it only in places that there is a double quoted element. In other words, constants do not work outside string definitions. If there are no double quotes around, make sure to add them.
    - ✅ Correct: `technology "${WEB}"`.
    - ❌ Incorrect: `technology ${WEB}` <- No double quotes around

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz constant \
  --constantName "<CONST_NAME>" \
  --constantValue "<value>"
```

## References

- Check the [documentation](https://docs.structurizr.com/dsl/basics#string-constants-and-variables) for further details.
