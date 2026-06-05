# View

## What is a View?

A view is a representation of a portion of a software architecture model. Views are used to visualize and communicate different aspects of the architecture to various stakeholders. There are different types of views:

- [systemLandscape](https://c4model.com/diagrams/system-landscape): a system context diagram without a specific focus on a particular software system.
- [systemContext](https://c4model.com/diagrams/system-context#system-context-diagram): the focus is on people (actors, roles, personas, etc) and software systems rather than technologies, protocols and other low-level details.
- [container](https://c4model.com/diagrams/container): The container diagram shows the high-level shape of the software architecture and how responsibilities are distributed across it. It also shows the major technology choices and how the containers communicate with one another.
- [component](https://c4model.com/diagrams/component): Next you can zoom in and decompose a container to describe the components that reside inside it; including their responsibilities and the technology/implementation details.
- [dynamic](https://c4model.com/diagrams/dynamic#dynamic-diagram): A dynamic diagram can be useful when you want to show how elements in the static model collaborate at runtime to implement a user story, use case, feature, etc. This dynamic diagram is based upon a UML communication diagram (previously known as a “UML collaboration diagram”). It is similar to a UML sequence diagram although it allows a free-form arrangement of diagram elements with numbered interactions to indicate ordering.
- [deployment](https://c4model.com/diagrams/deployment): A deployment diagram allows you to illustrate how instances of software systems and/or containers in the static model are deployed on to the infrastructure within a given deployment environment (e.g. production, staging, development, etc).

Each workspace can contain one or more views, defined with the views block. Check the [documentation](https://docs.structurizr.com/dsl/language#views) for further details.

## Create a View

1. Validate that the view you want to create does not already exist in the `./architecture/views` folder. If it exists, you can update it instead.

2. Create a new file `./architecture/{view-folder}/{view-name}.dsl` folder where `{view-name}` is a descriptive name, depending on the type of view you are creating:

    - For system landscape views: `system-landscape.dsl`
    - For system context views: `{system-name}-system-context.dsl`
    - For container views: `{container-name}-container.dsl`
    - For component views: `{component-name}-component.dsl`
    - For dynamic views: `{view-name}-dynamic.dsl`
    - For deployment views: `{environment-name}-deployment.dsl`
  
    For all options except deployment views, `{view-folder}` is `views`. For deployment views, `{view-folder}` is `environments`.

3. Populate the file with the relevant DSL code to define the view. Find examples of different view types in the [examples of views](../assets/views) folder.

    - For views that depend on an specific element (`systemContext`, `container`, `component`), make sure that the element exists in the workspace before creating the view. Also make sure to reference the element correctly in the view definition.
    - By default and for readabiility, include `autolayout lr` to arrange the elements from left to right.

### Dynamic Views

Unlike the other diagram types, Dynamic views are created by specifying the relationships that should be added to the view, within the dynamic block, as follows:

```dsl
dynamic {identifier} "{ViewKeyPascalCase}" {
    description "{view description}. ${AUTHOR}"

    1: SourceIdentifier -> DestinationIdentifier "description" "technology"
    2: SourceIdentifier -> DestinationIdentifier "description"
    autoLayout lr
}
```

Where `{identifier}` is:

- `*` when scope is `workspace`
- The DSL identifier of the software system when scope is `system`
- The DSL identifier of the container when scope is `container`

The DSL identifier comes from `element.properties["structurizr.dsl.identifier"]`, or falls back to the element name.

#### Scope and available elements

| Scope | Available elements |
|---|---|
| `workspace` | All elements in the workspace |
| `system` | Containers of the selected system; other software systems; people; external systems. Components and the scoped system itself are excluded. |
| `container` | Components of the selected container; people; external systems |

_⚠️ Important Note_: Dynamic views require that the relationships being referenced already exist in the workspace. Before creating a dynamic view, always check if the relationships exist. If they do not exist, create them first in the `./architecture/relationships` folder.

Step identifiers must use DSL identifiers (from `structurizr.dsl.identifier` property), not element display names. In interactive mode the tool resolves these automatically from workspace.json. In non-interactive mode the caller must provide the correct DSL identifiers.

### Deployment Views

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz view \
  --viewType "dynamic" \
  --dynamicScope "<workspace|system|container>" \
  --systemName "<system name>" \
  --containerName "<container name>" \
  --viewName "<view name>" \
  --viewDescription "<description>" \
  --step-1 'SourceIdentifier -> DestinationIdentifier "description" "technology"' \
  --step-2 'SourceIdentifier -> DestinationIdentifier "description"'
```

Flag rules:

- `--viewType`: The type of view to create. For dynamic views, use `dynamic`. Other supported values: `landscape`, `deployment`.
- `--dynamicScope`: required for `dynamic` view type. Values: `workspace`, `system`, `container`.
- `--systemName`: required when scope is `system` or `container`.
- `--containerName`: required when scope is `container`.
- `--step-N`: defines one relationship step. `N` is the step number (integer). Repeat the same `N` to produce **parallel steps** (same order number in the DSL output). Steps are sorted by `N` before being written.
- Step value format: `'SourceDslId -> DestinationDslId "description" "technology"'` — technology is optional.
- `--step-N` flags are optional. If omitted, interactive prompts collect steps.

**Parallel steps example:**

```bash
--step-1 'Web -> Db "Query" "SQL"' \
--step-1 'Web -> Cache "Check cache" "Redis"' \
--step-2 'Db -> Web "Results"'
```

Produces:

```dsl
1: Web -> Db "Query" "SQL"
1: Web -> Cache "Check cache" "Redis"
2: Db -> Web "Results"
```

For other view types:

```bash
scfz view \
  --viewType "<landscape|deployment>" \
  --viewName "<view name>" \
  --viewDescription "<description>"
```

The `--viewType` flag accepts `landscape`, `deployment`, or `dynamic`. For other view types (`systemContext`, `container`, `component`), create the DSL file manually following the instructions in the view reference.

## References

- Check the [documentation](https://docs.structurizr.com/dsl/language#views) for further details.
- Check [examples of views](../assets/views) for examples of view files.
