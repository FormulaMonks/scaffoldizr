# Container

## What is a Container?

In the C4 model, a container represents an application or a data store. A container is something that needs to be running in order for the overall software system to work. The container keyword defines a Container. Check the [documentation](https://docs.structurizr.com/dsl/language#container) for further details.

### Container archetypes

Container archetypes can be defined, as long as the archetype exists. Check [archetype documentation](./archetype.md) for further details.

## Create a Container

_⚠️ IMPORTANT:_ Containers can only be created when the [Workspace Scope](../SKILL.md#workspace-scope) is set to `softwaresystem`. If the scope is set to `landscape`, containers cannot be created. The containers need to be created within the main software system, which should be defined within the `./architecture/systems/_system.dsl` file. If the user attempts to create containers while the scope is set to `landscape`, **you should warn them that this is not allowed, as there is no main software system defined**.

1. Verify if a Container archetype has been created that fits the user's needs. If so, reference that archetype to create the Container.

2. Verify that the target software system where the container will be created already exists. If not, prompt the user to create that software system first. Refer to [structurizr-cli list elements](../extra/CLI.md#list-elements-within-a-workspace) to check existing elements.

3. Create a new file under `./architecture/containers/{system-name}/{container-name}.dsl` that follows this name format:

    - `{system-name}` is the name of the system the container belongs to, in kebab case (e.g. `system-name`).
    - `{container-name}` is the name of the container, in kebab case (e.g. `container-name`).

4. The file should contain the following information:

    ```dsl
    {elementName} = {type} "{displayName}" {
        description "{description}"
        technology "{technology}"
        tags "{tags}"
    }
    ```

    Where:
      - `{elementName}` is the name of the container, in pascal case (e.g. `ElementName`).
      - `{type}` is the name of the archetype if applicable, or `container` if no archetype is being used.
      - `{displayName}` is the display name of the container, in normal case, with spaces (e.g. `Container Name`).
      - `{description}` denotes a description of the container
      - `{technology}` denotes the technology for the container. E.g. `Java`, `MySQL`, `Docker`, etc.
      - `{tags}` are a list of comma-separated values to tag the container. Check [container type tags](../extra/TAGS.md#shape-tags).

5. Create relationships between the container and other elements (people, systems, containers, components, etc.) as needed. Follow instructions on [relationships](./relationship.md) documentation for further details on how to create relationships.

6. Validate the workspace to ensure the container has been created successfully and there are no errors. Refer to [structurizr-cli validate](../extra/CLI.md#validation-and-error-troubleshooting) for further details.

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz container \
  --systemName "<parent system name>" \
  --elementName "<container name>" \
  --containerDescription "<description>" \
  --containerType "<type>" \
  --containerTechnology "<technology>"
```

## References

- Check [container documentation](https://c4model.com/abstractions/container) for further details.
- Check [examples of containers](../examples/containers) for examples of container files.
