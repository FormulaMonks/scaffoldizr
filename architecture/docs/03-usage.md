
## CLI Usage

When you run Scaffoldizr:

1. The CLI displays a welcome message
2. It checks if the destination folder contains a `workspace.dsl` file
3. If no workspace is found, it automatically initiates the workspace creation generator
4. You'll be prompted with interactive questions to configure your workspace
5. The tool generates the appropriate scaffolding based on your answers

## Supported Elements

| Element | Description | Prompts |
| :-----: | :---------- | :------ |
| `Workspace` | Creates a new workspace with proper scaffolding. Automatically triggered when no `workspace.dsl` file is found. Creates workspace structure including `workspace.dsl`, system files, relationships, and configuration files. | Workspace name, description, scope (Software System/Landscape), system details (if applicable), author info (from git config), theme preference |
| `🟡 Constant` | Reusable constant that can be referenced across diagrams and relationships. Appends the constant definition to `workspace.dsl`. | Constant name, value |
| `🔺 Archetype` | [Reusable element templates](https://docs.structurizr.com/dsl/archetypes) (Container, Component, Software System, or Relationship). Creates `architecture/archetypes/{name}_{baseType}.dsl`. | Archetype name, base type, optional technology, optional tags |
| `👤 Person` | An actor or user interacting with systems. Creates/appends to `systems/_people.dsl` and `relationships/_people.dsl`. | Person name, description, relationships, technology |
| `🟦 System` | Creates a system. Available for landscape scope only. (See [scope](https://docs.structurizr.com/workspaces/scope)) | System name, description, relationships |
| `⬜️ External System` | Creates an external system not owned by the development team (e.g., third-party dependencies, external APIs). Appends to `systems/_external.dsl` and `relationships/_external.dsl`. | Parent system, external system name, description, relationships |
| `🔷 Container` | Creates a deployable/executable unit within a system (web app, database, API, message broker, etc.). Creates container file, view, and relationship files. Supports types: EventBus, MessageBroker, Function, Database, WebApp, MobileApp. | Parent system, container name, description, type, technology, relationships |
| `🔹 Component` | Creates a component within a container (controller, service, repository, etc.). Requires at least one existing container. Creates/updates component files, includes, views, and relationships. | Parent container, component name, description, technology, relationships |
| `🔳 View` | Creates Structurizr views for visualizing architecture. Supports Deployment and Landscape view types. Creates view files and environment configurations. See [Supported View Types](#supported-view-types) below. | View type, system name (if needed), view name, description, instance details (for deployment) |

## Supported View Types

| View type | Description |
| :-------: | :---------- |
| `landscape` | System Landscape view. Showcases system and external relationships. |
| `deployment` | Useful for displaying infrastructure and resources. |
