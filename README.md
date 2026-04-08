# Scaffoldizr: Scaffolding to create Structurizr Workspaces

[Structurizr Workspaces](https://docs.structurizr.com/workspaces) are a great way to document and share architecture diagrams in the [C4 model](https://c4model.com/). However, the diagram creation is freeform and there are no guidelines to break code into files, leaving architects and developers with a feeling of not knowing where to start.

This is an opinionated scaffolding tool written in TypeScript/[Bun](https://bun.sh/) that attempts to create the building blocks of a solid system architecture documentation, that accounts for newcomers as well as architects experienced in Structurizr, to allow them to follow a convention while setting them up for success.

## Installation

Run in your terminal:

```bash
curl -s https://formulamonks.github.io/scaffoldizr/assets/install.sh | sh
```

Then, verify the tool is correctly installed:

```bash
scfz --version
```

## Usage

```bash
scfz --dest {docs_folder}
```

where `{docs_folder}` is a folder where dsl files will be generated. The tool creates an `architecture/` folder and starts scaffolding from there. `{docs_folder}` default value is current working directory. So you can just issue `scfz` command.

## Non-Interactive Usage (AI Agent Mode)

Scaffoldizr supports non-interactive execution by routing to specific subcommands and passing parameters as CLI flags. This mode is ideal for AI agents or automation scripts.

### Subcommand Routing

When a workspace already exists, you can bypass the main menu by specifying a generator as a subcommand:

```bash
scfz <generator> [options]
```

### Passing Arguments

All prompt questions can be answered via CLI flags using the `--parameter "value"` format. Note that parameters must be space-separated.

#### Workspace Generator (Initial Setup)

Used when no `workspace.dsl` exists in the destination:

```bash
scfz --dest . \
  --workspaceName "My Workspace" \
  --workspaceDescription "A sample workspace" \
  --workspaceScope "softwaresystem" \
  --systemName "My System" \
  --systemDescription "Core system" \
  --authorName "Jane Doe" \
  --authorEmail "jane@example.com" \
  --shouldIncludeTheme "false"
```

#### Element Generators

Once a workspace is initialized, use these subcommands:

| Generator | Description | Common Arguments |
| ----------- | ------------- | ------------------ |
| `system` | Software System | `--systemName`, `--systemDescription`, `--archetype` |
| `container` | Container | `--systemName` (parent), `--elementName`, `--containerDescription`, `--containerType`, `--containerTechnology` |
| `component` | Component | `--container` (parent), `--elementName`, `--componentDescription`, `--componentTechnology` |
| `person` | Person | `--elementName`, `--personDescription` |
| `external-system` | External System | `--elementName`, `--extSystemDescription` |
| `view` | View | `--viewType` (landscape/deployment), `--viewName`, `--viewDescription` |
| `constant` | Constant | `--constantName`, `--constantValue` |
| `archetype` | Archetype | `--archetypeName`, `--archetypeDescription` |

### Scope and Validation Rules

* **Scope Restriction**: Generators are restricted by the workspace scope defined in `workspace.dsl`.
  * **Landscape**: Allows `system`, `person`, `external-system`, `view`, `relationship`, `constant`, `archetype`.
  * **SoftwareSystem**: Allows `container`, `component`, `person`, `external-system`, `view`, `relationship`, `constant`, `archetype`.
  * Using an unsupported generator for the current scope will result in a non-zero exit code.
* **Uniqueness Validation**: Element names must be unique. If a duplicate name is provided in non-interactive mode, the command will fail with exit code 1.
* **Decisions Folder**: Every scaffolded workspace includes an `architecture/decisions/` folder for Architecture Decision Records (ADRs).

[Full documentation here](https://formulamonks.github.io/scaffoldizr/).
