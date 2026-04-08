# Person

## What is a person in C4 Model?

In the C4 model, a person represents a user or actor that interacts with the software system. This could be a human user, a content editor, a system administrator, or any other role that interacts with the system. The person keyword defines a person. Check the [documentation](https://docs.structurizr.com/dsl/language#person) for further details.

## Create a Person

1. Verify that the person does not already exist in the `./architecture/systems/_people.dsl` file.  Refer to [structurizr-cli list elements](../extra/CLI.md#list-elements-within-a-workspace).

2. Create a new entry under `./architecture/systems/_people.dsl`. Create the file if it does not exist.

3. The person definition should follow this format:

    ```dsl
    {elementName} = person "{displayName}" {
        description "{description}"
        tags "{tags}"
    }
    ```

    Where:
      - `{elementName}` is the name of the person, in pascal case (e.g. `ElementName`).
      - `{displayName}` is the display name of the person, in normal case, with spaces (e.g. `Person Name`).
      - `{description}` denotes a description of the person.
      - `{tags}` are a list of comma-separated values to tag the person. Check [person type tags](../extra/TAGS.md).

4. Create relationships between the person and other elements (software systems, containers, etc.) as needed. Follow instructions on [relationships](./relationship.md) documentation for further details on how to create relationships.

5. Validate the workspace to ensure the person has been created successfully and there are no errors. Refer to [structurizr-cli validate](../extra/CLI.md#validation-and-error-troubleshooting) for further details.

## References

- Check [examples of people](../examples/people) for examples of person files.
