
Scaffoldizr provides an opinionated framework for AI agents to generate and interact with [Structurizr workspaces](https://docs.structurizr.com/workspaces). By following a consistent folder structure and non-interactive CLI patterns, AI agents can reliably build and maintain C4 model architecture documentation.

## Overview

The AI Agent integration is designed for scenarios where:

* An AI agent needs to create or update elements within a Structurizr workspace.
* Architecture diagrams (leveraging the C4 model) need to be generated automatically.
* An existing Structurizr workspace requires validation or refactoring.

## Installation

The AI integration is available as a skill for agents that support OpenCode skills or similar tool-based environments. To enable it, ensure the Scaffoldizr CLI is installed in the agent's environment:

```bash
curl -s https://formulamonks.github.io/scaffoldizr/assets/install.sh | sh
```

The agent should then have access to the `scfz` command for non-interactive operations.

## Folder Structure

Scaffoldizr generates a predictable folder structure within the `architecture/` directory, making it easy for AI agents to locate and modify specific architectural elements:

* `archetypes/`: Reusable relationship patterns and baseline elements.
* `systems/`: Software system definitions, including people (`_people.dsl`) and external systems (`_external.dsl`).
* `containers/<system name>/`: Container definitions for a specific software system.
* `components/<system name>/<container name>/`: Component definitions for a specific container.
* `relationships/`: Global relationship definitions between elements.
* `views/`: View definitions for rendering diagrams (context, container, component, etc.).
* `decisions/`: Architecture Decision Records (ADRs) documenting key design choices.
* `docs/`: Documentation files referenced within the workspace.
* `environments/`: Deployment nodes and infrastructure definitions.

## Workspace Scope

AI agents must respect the workspace scope defined in `architecture/workspace.dsl`. The scope determines which elements can be created:

1.  **Landscape Scope**: Allows creating `system`, `person`, `external-system`, `view`, `relationship`, `constant`, and `archetype`.
2.  **SoftwareSystem Scope**: Allows creating `container`, `component`, `person`, `external-system`, `view`, `relationship`, `constant`, and `archetype`.

Agents should verify the current scope before attempting to scaffold new elements to ensure consistency with the C4 model levels.

## Creating Elements

AI agents interact with the workspace using the `scfz` CLI tool in non-interactive mode. This is achieved by passing arguments as flags to bypass interactive prompts.

For a detailed list of subcommands and parameters, refer to the [Usage Guide](./03-usage.md).

## Workspace Build Process

* **Source**: The `architecture/workspace.dsl` file is the primary entry point.
* **Compilation**: The DSL files are compiled into a single `architecture/workspace.json` file.
* **Visualization**: Use the provided scripts (e.g., `architecture/scripts/run.sh`) to start Structurizr Lite and visualize diagrams at `http://localhost:8080`.

Agents should never modify the `workspace.json` file directly; all changes should be made to the DSL source files.
