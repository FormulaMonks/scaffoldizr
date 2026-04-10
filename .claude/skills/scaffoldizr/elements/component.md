# component

## What is a component?

In the C4 model, a component is a grouping of related functionality encapsulated behind a well-defined interface. If you’re using a language like Java or C#, the simplest way to think of a component is that it’s a collection of implementation classes behind an interface. With the C4 model, components are not separately deployable units. Instead, it’s the container that’s the deployable unit. The component keyword defines a component. Check the [documentation](https://docs.structurizr.com/dsl/language#component) for further details.

### Component archetypes

Component archetypes can be defined, as long as the archetype exists. Check [archetype documentation](./archetype.md) for further details.

## Create a component

_⚠️ IMPORTANT:_ Components can only be created when the [Workspace Scope](../SKILL.md#workspace-scope) is set to `softwaresystem`. If the scope is set to `landscape`, components cannot be created. The components need to be created within a container.

- If the user attempts to create components while the scope is set to `landscape`, **you should warn them that this is not allowed, as there is no main software system defined**.
- If the user attempts to create components without specifying the container they belong to, **you should warn them that this is not allowed, as components must belong to a container**. You can suggest to create the container it should belong to first.

1. Verify if a Component archetype has been created that fits the user's needs. If so, reference that archetype to create the Component.

2. Verify that the target container where the component will be created already exists. If not, prompt the user to create that container first. Refer to [Structurizr list elements](../extra/CLI.md#list-elements-within-a-workspace) to check existing elements.

3. Create a new entry under `./architecture/components/{system-name}/{container-name}.dsl`. Create the file if it does not exist. The file name should follow this name format:

    - `{system-name}` is the name of the system the container belongs to, in kebab case (e.g. `system-name`).
    - `{container-name}` is the name of the container the component belongs to, in kebab case (e.g. `container-name`).

4. The file should add the following information:

    ```dsl
    {containerName}_{elementName} = {type} "{displayName}" {
        description "{description}"
        technology "{technology}"
        tags "{tags}"
    }
    ```

    Where:
      - `{containerName}` is the name of the container the component belongs to, in pascal case (e.g. `ContainerName`).
      - `{elementName}` is the name of the component, in pascal case (e.g. `ElementName`).
      - `{type}` is the name of the archetype if applicable, or `component` if no archetype is being used.
      - `{displayName}` is the display name of the component, in normal case, with spaces (e.g. `Component Name`).
      - `{description}` denotes a description of the component
      - `{technology}` denotes the technology for the component. E.g. `Java`, `Spring Boot`, `React`, etc.
      - `{tags}` are a list of comma-separated values to tag the component. Check [container type tags](../extra/TAGS.md#status-tags).

5. Create relationships between the component and other elements (people, systems, containers, components, etc.) as needed. Follow instructions on [relationships](./relationship.md) documentation for further details on how to create relationships.

6. Validate the workspace to ensure the component has been created successfully and there are no errors. Refer to [Structurizr validate](../extra/CLI.md#validation-and-error-troubleshooting) for further details.

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz component \
  --elementName "<component name>" \
  --componentDescription "<description>" \
  --componentTechnology "<technology>"
```

## References

- Check [component documentation](https://c4model.com/abstractions/component) for further details.
- Check [examples of components](../examples/components) for examples of component files.
