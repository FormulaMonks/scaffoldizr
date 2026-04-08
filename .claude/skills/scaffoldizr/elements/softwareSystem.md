# Software System

## What is a Software System?

A software system is the highest level of abstraction and describes something that delivers value to its users, whether they are human or not. This includes the software system you are modelling, and the other software systems upon which your software system depends (or vice versa).

The softwareSystem keyword defines a software system. Check the [documentation](https://docs.structurizr.com/dsl/language#softwaresystem) for further details.

### Software System archetypes

Software System archetypes can be defined, as long as the archetype exists. Check [archetype documentation](./archetype.md) for further details.

## Create a Software System

_⚠️ IMPORTANT:_ Software Systems can only be created when the [Workspace Scope](../SKILL.md#workspace-scope) is set to `landscape`. If the scope is set to `softwaresystem`, only one software system can be created, which is the main software system being modelled. This main software system should be defined within the `./architecture/systems/_system.dsl` file. If the user attempts to create additional software systems while the scope is set to `softwaresystem`, **you should warn them that this is not allowed**.

1. Verify if a Software System archetype has been created that fits the user's needs. If so, reference that archetype to create the Software System.

2. Create a new file under `./architecture/systems` that follows this name format: `{element-name}.dsl` where:

    - `{element-name}` is the name of the software system, in kebab case (e.g. `element-name`), unless it's a special file:
      - `_system.dsl`: refers to the main software system being modelled. This file should be used only when the Workspace Scope is set to `softwaresystem`.
      - `_external.dsl`: refers to external software systems. This file should be used to define all external software systems that interact with the main software system.

3. The file should contain the following information:

    ```dsl
    {elementName} = {type} "{displayName}" {
        description "{description}"
        tags "{tags}"
    }
    ```

    Where:
      - `{elementName}` is the name of the software system, in pascal case (e.g. `ElementName`).
      - `{type}` is the name of the archetype if applicable, or `softwareSystem` if no archetype is being used.
      - `{displayName}` is the display name of the software system, in normal case, with spaces (e.g. `Element Name`).
      - `{description}` denotes a description of the software system
      - `{tags}` are a list of comma-separated values to tag the software system. E.g. `System,External` for external systems. Check [container type tags](../extra/TAGS.md#status-tags).

4. Create relationships between the software system and other elements (people, systems, containers, etc.) as needed. Follow instructions on [relationships](./relationship.md) documentation for further details on how to create relationships.

5. Validate the workspace to ensure the software system has been created successfully and there are no errors. Refer to [structurizr-cli validate](../extra/CLI.md#validation-and-error-troubleshooting) for further details.

## References

- Check [software system documentation](https://c4model.com/abstractions/software-system) for further details.
- Check [examples of software systems](../examples/softwareSystems) for examples of software system files.
