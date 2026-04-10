
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
| `🎨 Theme` | Manage workspace themes (add, remove, list). Updates the `themes` line in `architecture/workspace.dsl`. Available in both Landscape and SoftwareSystem scopes. | `themeAction`, `additionalThemes` |

## Supported View Types

| View type | Description |
| :-------: | :---------- |
| `landscape` | System Landscape view. Showcases system and external relationships. |
| `deployment` | Useful for displaying infrastructure and resources. |

## Non-Interactive Usage (AI Agent Mode)

Scaffoldizr supports non-interactive execution by routing to specific subcommands and passing parameters as CLI flags. This mode is ideal for AI agents or automation scripts.

### Subcommand Routing

When a workspace already exists, you can bypass the main menu by specifying a generator as a subcommand:

```bash
scfz <generator> [options]
```

### Passing Arguments

All prompt questions can be answered via CLI flags using `--parameter "value"` or `--parameter=value` format.

#### Workspace Generator (Initial Setup)

Used when no `workspace.dsl` exists in the destination:

```bash
scfz --dest "." \
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
| :-------: | :---------- | :--------------- |
| `system` | Software System | `--systemName`, `--systemDescription`, `--archetype` |
| `container` | Container | `--systemName` (parent), `--elementName`, `--containerDescription`, `--containerType`, `--containerTechnology` |
| `component` | Component | `--elementName`, `--componentDescription`, `--componentTechnology` |
| `person` | Person | `--elementName`, `--personDescription` |
| `external-system` | External System | `--elementName`, `--extSystemDescription` |
| `view` | View | `--viewType` (landscape/deployment), `--viewName`, `--viewDescription` |
| `constant` | Constant | `--constantName`, `--constantValue` |
| `archetype` | Archetype | `--archetypeName`, `--archetypeDescription` |
| `theme` | Manage Themes | `--themeAction "Add themes" --additionalThemes "<url1>,<url2>"` |

### Scope and Validation Rules

* **Scope Restriction**: Generators are restricted by the workspace scope defined in `workspace.dsl`.
  * **Landscape**: Allows `system`, `person`, `external-system`, `view`, `relationship`, `constant`, `archetype`.
  * **SoftwareSystem**: Allows `container`, `component`, `person`, `external-system`, `view`, `relationship`, `constant`, `archetype`.
  * Using an unsupported generator for the current scope will result in a non-zero exit code.
* **Uniqueness Validation**: Element names must be unique. If a duplicate name is provided in non-interactive mode, the command will fail with exit code 1.
* **Color Theme Exclusivity**: The `theme` generator enforces that only one color-based theme (Blue, Red, Green, Yellow) can be active at a time. Selecting a new color theme automatically replaces the existing one.
* **Decisions Folder**: Every scaffolded workspace includes an `architecture/decisions/` folder for Architecture Decision Records (ADRs).

## Workspace Tooling

Scaffoldizr generates helper scripts and an environment file to manage your workspace locally and remotely. These are located in the `architecture/scripts/` folder.

> **Note**: All Structurizr operations now use the unified `structurizr/structurizr` Docker image, which replaces the previously separate `structurizr/lite` image and `structurizr-cli` tool. Docker must be installed and running.

Both **Bash** (`.sh`) and **PowerShell** (`.ps1`) variants are generated for every script. Use the one that matches your operating system:

| OS | Script |
| :- | :----- |
| macOS / Linux | `run.sh`, `update.sh` |
| Windows | `run.ps1`, `update.ps1` |

> **Windows users**: Run PowerShell scripts with `.\architecture\scripts\run.ps1` from a PowerShell terminal. If script execution is blocked, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once to allow local scripts.

### run — View Workspace Locally

Starts a local Structurizr server using Docker to visualize your architecture diagrams in the browser.

```bash
# macOS / Linux
./architecture/scripts/run.sh [port]

# Windows (PowerShell)
.\architecture\scripts\run.ps1 [port]
```

- The optional `[port]` argument sets the local port (default: `8080`).
- Access the workspace at `http://localhost:8080` after running.
- The script validates that `workspace.json` exists before starting.
- Stopping the script (Ctrl+C) automatically stops the Docker container.

**How it works**: Mounts the `architecture/` folder into the Docker container and runs `structurizr/structurizr local`.

### update — Push Workspace to Remote

Pushes the compiled `workspace.json` to a remote Structurizr instance using the unified CLI.

```bash
# macOS / Linux
./architecture/scripts/update.sh

# Windows (PowerShell)
.\architecture\scripts\update.ps1
```

- Requires a `.env-arch` file in the `architecture/` folder (see below).
- Validates that `workspace.json` exists before pushing.
- Performs a non-merging push — the remote workspace is fully replaced.

**How it works**: Reads `architecture/.env-arch` for credentials, then runs `structurizr/structurizr push` inside Docker.

For all available Structurizr CLI commands, see the [Structurizr commands reference](https://docs.structurizr.com/commands).

### .env-arch — Remote Credentials

The `architecture/.env-arch` file holds the authentication credentials required by `update.sh` / `update.ps1`. It is **not committed to version control**.

Create an `.env-arch` file inside the `architecture/` folder with the following variables:

```bash
STCTZR_URL=https://api.structurizr.com
STCTZR_WORKSPACE_ID=<your-workspace-id>
STCTZR_WORKSPACE_KEY=<your-api-key>
# STCTZR_PASSPHRASE=<your-passphrase>  # Optional: only required if client-side encryption is enabled on the workspace
```

You can find these values in your Structurizr workspace settings. `STCTZR_PASSPHRASE` is optional and only needed if you have enabled [client-side encryption](https://docs.structurizr.com/cloud/client-side-encryption) on your workspace.

