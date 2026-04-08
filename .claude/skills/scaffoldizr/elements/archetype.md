# Archetype

## What is an archetype?

The archetype feature provides a way to create user defined types that extend the basic element or relationship types and optionally add some defaults for descriptions, technology, tags, properties, and perspectives.

Refer to the [documentation](https://docs.structurizr.com/dsl/archetypes) for further details.

## Archetype supported types

- softwareSystem
- relationship
- container (available only for `softwaresystem` [Workspace Scope](../SKILL.md#workspace-scope))
- component (available only for `softwaresystem` [Workspace Scope](../SKILL.md#workspace-scope))

## Create an archetype element

1. Create a new file under `./architecture/archetypes` that follows this name format: `{consecutive}_{name}_{type}.dsl`

    - `{consecutive}` refers to the immediate number that follows the order of the contents of the folder. E.g.: if there is a file called `1_http_relationship.dsl`, the consecutive for the next file is `2`.
    - `{name}` is the name of the archetype element, in camel case (e.g. `elementName`).
    - `{type}` is the element type. It can be only `container`, `component`, `softwareSystem` or `relationship`

2. The file should contain the following information:

    ```dsl
    {name} = {type} {
        description "{description}"
        technology "{technology}"
        tags "{tags}"
    }
    ```

    Where:
      - `{name}` is the name of the archetype element, in camel case (e.g. `elementName`).
      - `{type}` is the element type. It can be only `container`, `component`, `softwareSystem` or `->` in case it's of type relationship.
        - Archetypes can extend from other archetypes if they are of the same base element type. The type in such case would correspond to the name of the archetype it would extend from. Here are two examples:
          - If there is a file called `1_nodejsApp_container.dsl`, it means that a new container archetype can be created which inherits from it. In this case, the type should be `nodejsApp`
          - If there is a file called `1_http_relationship.dsl`, it means that a new relationship archetype can be created which inherits from it. In this case the type should be `--http->`.
      - `{description}` denotes a description of the element
      - `{technology}` denotes the technology for the element. `softwareSystem` does not allow technology field.
      - `{tags}` are a list of comma-separated values to tag the element.

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz archetype \
  --archetypeName "<archetype name>" \
  --archetypeDescription "<description>"
```

## References

Check [examples of archetypes](../examples/archetypes) for examples of archetype files.
