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

3. Populate the file with the relevant DSL code to define the view. Find examples of different view types in the [examples of views](../examples/views) folder.

    - For views that depend on an specific element (`systemContext`, `container`, `component`), make sure that the element exists in the workspace before creating the view. Also make sure to reference the element correctly in the view definition.
    - By default and for readabiility, include `autolayout lr` to arrange the elements from left to right.

### Dynamic Views

Unlike the other diagram types, Dynamic views are created by specifying the relationships that should be added to the view, within the dynamic block, as follows:

```dsl
dynamic {identifier} "{view key}" {
    title "{view title}"
    description "{view description} ${AUTHOR}"

    [order:] {sourceIdentifier} -> {destinationIdentifier} "{relationship description}" "{technology}"
    [order:] {sourceIdentifier} -> {destinationIdentifier} "{relationship description}" "{technology}"
    [order:] {sourceIdentifier} -> {destinationIdentifier} "{relationship description}" "{technology}"
}
```

Where:

- `{identifier}`: is either a software system or container identifier. The identifier has to exist.
- `{view key}`: is a unique key for the view in PascalCase.
- `{view title}`: is a human friendly title for the view.
- `{view description}`: is a short description of the view.
- Each relationship line defines a relationship to be included in the view.
- `{sourceIdentifier}` and `{destinationIdentifier}`: are the identifiers of the source and destination elements of the relationship. They have to exist.
- `{relationship description}`: is a short description of the relationship.
- `{technology}`: is the technology used in the relationship.
- `[order:]`: is an optional order number to define the sequence of the relationships in the view.

_⚠️ Important Note_: Dynamic views require that the relationships being referenced already exist in the workspace. Before creating a dynamic view, always check if the relationships exist. If they do not exist, create them first in the `./architecture/relationships` folder.

### Deployment Views

## References

- Check the [documentation](https://docs.structurizr.com/dsl/language#views) for further details.
- Check [examples of views](../examples/views) for examples of software system files.
