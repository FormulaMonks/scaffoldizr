---
name: scaffoldizr
description: Creates Structurizr elements and workspace based on Scaffoldizr opinionated convention
license: MIT
metadata:
  author: Andrés Zorro <andres.zorro@monks.com>
  version: 0.11.4
---

# Structurizr Workspace - Created with Scaffoldizr

This skill enables Copilot to generate and interact with a [Structurizr workspace](https://docs.structurizr.com/workspaces), generated with [Scaffoldizr CLI tool](https://formulamonks.github.io/scaffoldizr/)

## When to use this skill

- Whenever the user needs to create or update elements within a given Structurizr workspace.
- Whenever the user needs to create an architecture diagram (leveraging the C4 model).
- Whenever the user needs to validate an existing Structurizr workspace.

## General instructions

- In the root folder, search for an `./architecture` folder. If there is no such folder, offer to create one using Scaffoldizr, run:

  ```bash
  scfz --dest <root_folder> \
    --workspaceName "<name>" \
    --workspaceDescription "<description>" \
    --workspaceScope "softwaresystem" \
    --systemName "<system name>" \
    --systemDescription "<system description>" \
    --authorName "<author name>" \
    --authorEmail "<author email>" \
    --shouldIncludeTheme "false"
  ```

  Scaffoldizr will create the `./architecture` folder with all the relevant files.

## Non-interactive CLI usage (AI Agent Mode)

Scaffoldizr supports non-interactive execution by specifying a generator as a subcommand and passing all prompt answers as CLI flags. **This is the preferred approach for AI agents** — it avoids interactive prompts entirely.

### Subcommand routing

When a `workspace.dsl` already exists, bypass the main menu by specifying a generator subcommand:

```bash
scfz <generator> [--flag "value"]
```

Generator names are kebab-cased: `external-system`, `software-system`, etc.

### Passing arguments

All prompt questions can be answered via CLI flags using `--parameter "value"` or `--parameter=value` format.

### Element generators reference

| Generator | Common Flags |
|---|---|
| `system` | `--systemName`, `--systemDescription`, `--archetype` |
| `container` | `--systemName` (parent), `--elementName`, `--containerDescription`, `--containerType`, `--containerTechnology` |
| `component` | `--elementName`, `--componentDescription`, `--componentTechnology` |
| `person` | `--elementName`, `--personDescription` |
| `external-system` | `--elementName`, `--extSystemDescription` |
| `view` | `--viewType`, `--viewName`, `--viewDescription` |
| `constant` | `--constantName`, `--constantValue` |
| `archetype` | `--archetypeName`, `--archetypeDescription` |
| `theme` | `--themeAction "Add themes" --additionalThemes "<url1>,<url2>"` |

Each element file documents the specific flags and CLI command for that generator.

- All the relevant documentation files are contained within the `./architecture` folder.
- The main entrypoint is the `./architecture/workspace.dsl` file.
- The file which Structurizr CLI and Structurizr Lite use to "compile" diagrams is `./architecture/workspace.json`

## Folder contents

The architecture folder contains the following structure:

- `./architecture/archetypes`: Elements that serve as baseline or foundations for other elements. Contains reusable relationship patterns (e.g., `1_https_relationship.dsl`).
- `./architecture/containers/<system name>`: Container definitions for a software system. Each software system is contained within an independent folder.
- `./architecture/components/<system name>/<container name>`: Component definitions for a software system. Each software system is contained within an independent folder, as well as each container.
- `./architecture/decisions`: Architecture Decision Records (ADRs) documenting key architectural decisions.
- `./architecture/docs`: Documentation files referenced in the workspace.
- `./architecture/environments`: This folder contains elements for Deployment view. They are used to create and display deployment diagrams.
- `./architecture/relationships`: Relationship definitions for the different elements within the system.
- `./architecture/systems`: System definitions. This folder also contains `_people.dsl` to reference person elements and `_external.dsl` to reference external systems (systems that are not in scope of the actual diagram).
- `./architecture/views`: View definitions that render diagrams, including system context views.

## Relationships in diagrams

- Structurizr DSL language has the `!include` directive which serves as a way to reference other files and folders. If the reference includes a file extension (e.g. `file.dsl`), that file at that path is included. If no extension is included, it assumes that all files within that folder are included.

### Workspace Scope

- Depending on the workspace scope you are allowed to create or not certain elements. The workspace can be scoped as `softwaresystem` or as `landscape`.
  1. In both options you are allowed to create `archetype`, `constant`, `view`, `person`, `external system` and `relationship`.
  2. If it's `softwaresystem` you are allowed ONLY to create `container`, `component` in addition to the ones listed in point 1.
  3. If it's `landscape` you're allowed ONLY to create `system` in addition to the ones listed in point 1.

- Find what is the current workspace scope by checking the `./architecture/workspace.dsl` file for the `workspace` block. E.g.:

```dsl
workspace {
    ...
    configuration {
        scope softwaresystem  // <-- Here is where the scope is defined
    }
    ...
}
```

- Always alert the user when the suggested action would be in conflict with this rule.

## Create new elements within the workspace

**⚠️ IMPORTANT NOTE** Element names have to be unique within the workspace. Before creating a new element, always check if an element with the same name already exists. If it does, propose an alternative name to the user.

### Archetype

Refer to [archetype](./elements/archetype.md) documentation

### Constant

Refer to [constant](./elements/constant.md) documentation

### Software System

Refer to [software system](./elements/softwareSystem.md) documentation

### External System

Refer to [external system](./elements/externalSystem.md) documentation

### Container

Refer to [container](./elements/container.md) documentation

### Component

Refer to [component](./elements/component.md) documentation

### Relationship

Refer to [relationship](./elements/relationship.md) documentation

### View

Refer to [view](./elements/view.md)

### Theme

Use the `theme` generator to add, remove, or list workspace themes. The `theme` generator is available in both Landscape and SoftwareSystem scopes.

```bash
scfz theme \
  --themeAction "Add themes" \
  --additionalThemes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json"
```

- `--themeAction`: `"Add themes"` | `"Remove themes"` | `"List themes"`
- `--additionalThemes`: comma-separated theme URLs to add
- Color themes (Blue, Red, Green, Yellow) are mutually exclusive — selecting a new color replaces the existing one

## Use Structurizr CLI commands to interact with the workspace

Refer to [CLI commands](./extra/CLI.md) documentation

---

## Build process

- The `./architecture/workspace.dsl` is the source file that compiles to `./architecture/workspace.json`
- The compiled JSON file contains the complete model including elements, relationships, views, and styling. ⚠️ **DO NOT MODIFY `./architecture/workspace.json` DIRECTLY** ⚠️.
- Use `./architecture/scripts/run.sh` to start Structurizr Lite and visualize diagrams at `http://localhost:8080`

## Error Troubleshooting

Whenever the user reports an error when visualizing the Structurizr workspace, check first if you can validate reported errors with Structurizr CLI. [Check here for more information](./extra/CLI.md). Make sure to address all issues reported by the tool before continuing.
