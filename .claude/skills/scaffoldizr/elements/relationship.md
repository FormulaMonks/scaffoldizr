# Relationship

## What is a Relationship?

A relationship between two elements is illustrated by unidirectional (one-way) arrow as follows: (->)Bidirectional (two-way) arrows are not supported by Structurizr. Check the [documentation](https://docs.structurizr.com/dsl/language#relationship) for further details.

### Relationship archetypes

Relationship archetypes can be defined, as long as the archetype exists. Check [archetype documentation](./archetype.md) for further details.

## Create a relationship

1. Verify if a Relationship archetype has been created that fits the user's needs. If so, reference that archetype to create the relationship.

2. Verify that the elements that will be part of the relationship (source and target) already exist. If not, prompt the user to create those elements first. Refer to [structurizr-cli list elements](../extra/CLI.md#list-elements-within-a-workspace) to check existing elements.

3. The relationship should be created within the file of the source element (person, software system, or external software system) that initiates the relationship. Create the file if it does not exist. The options are as follows:

    - For a relationship from a person, add it to the `./architecture/relationships/_people.dsl`.
    - For a relationship from a software system, add it to the corresponding software system file under `./architecture/relationships/{system-name}.dsl` or `./architecture/relationships/_system.dsl` for main systems, or `./architecture/relationships/_external.dsl` for external systems.
    - For a relationship from a container or a component, add it to the software system it belongs to, under `./architecture/relationships/{system-name}.dsl` or `./architecture/relationships/_system.dsl`.

4. The relationship definition should follow this format:

    ```dsl
    {sourceElement} {relationship} {targetElement} "{description}"
    ```

    Where:
      - `{sourceElement}` is the name of the source element (person, software system, container, or component) in pascal case (e.g. `SourceElement`).
      - `{relationship}` is the relationship type or archetype name if applicable, or `->` if no archetype is being used.
      - `{targetElement}` is the name of the target element (person, software system, container, or component) in pascal case (e.g. `TargetElement`).
      - `{description}` denotes the relationship between the elements. E.g. "Uses", "Sends data to", "Reads from", etc. This description is optional when using relationship archetypes that already define it.

5. Validate the workspace to ensure the relationship has been created successfully and there are no errors. Refer to [structurizr-cli validate](../extra/CLI.md#validation-and-error-troubleshooting) for further details.

## References

- Check [relationship documentation](https://docs.structurizr.com/dsl/language#relationship) for further details.
- Check [examples of relationships](../examples/relationships) for examples of relationship files.
