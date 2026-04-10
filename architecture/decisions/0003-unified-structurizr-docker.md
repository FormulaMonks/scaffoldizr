# 3. Migrate to Unified Structurizr Docker Image

Date: 2026-04-10

## Status

Accepted

## Context

Scaffoldizr relied on two separate Structurizr tools:

1. **`structurizr/lite`** Docker image — used by `run.sh` to serve the workspace locally for authoring and visualization.
2. **`structurizr-cli`** standalone binary — used by `update.sh` to push the workspace to a remote Structurizr instance, and by the CLI's `--export` flag to compile `workspace.dsl` to `workspace.json`.

In late 2025, Structurizr announced the consolidation of all its tools — Structurizr Lite, Structurizr CLI, and Structurizr on-premises — into a **single unified tool and Docker image**: `structurizr/structurizr`. The cloud service is scheduled to shut down on 30 September 2026.

The previously separate tools (`structurizr/lite`, `structurizr-cli`, `structurizr/onpremises`) are now end-of-life and will receive no further updates. All CLI commands (`local`, `push`, `pull`, `export`, `validate`, `list`, `inspect`) are now subcommands of the unified image.

Notably, the new `push` command no longer accepts a `-secret` flag. Authentication uses a single API key via `-key`.

## Decision

We migrate all Scaffoldizr tooling to exclusively use the unified `structurizr/structurizr` Docker image:

1. **`run.sh`**: Changed from `structurizr/lite` to `docker run ... structurizr/structurizr local`. The `architecture/` folder is mounted as the Structurizr workspace root at `/usr/local/structurizr`.
2. **`update.sh`**: Changed from `structurizr-cli push` to `docker run ... structurizr/structurizr push`. The `-secret` flag is dropped (no longer supported); only `-url`, `-id`, and `-key` are used. The `architecture/` folder is mounted and `workspace.json` is referenced at `/usr/local/structurizr/workspace.json`.
3. **`--export` flag** in the CLI: Changed from spawning `structurizr-cli export` to `docker run ... structurizr/structurizr export -w ... -f json -o ...`.
4. **AI Agent skill** (`.claude/skills/scaffoldizr/`): Updated all `structurizr-cli` references to use Docker equivalents with the correct `-w` flag.
5. **`.env-arch` template**: Removed `STCTZR_WORKSPACE_SECRET` as it has no corresponding flag in the new image.

The `structurizr-cli` binary dependency is fully dropped. Docker is now the sole runtime dependency for Structurizr operations.

## Consequences

**Positive:**
- Users need only Docker installed — no separate `structurizr-cli` binary to download and manage.
- All Structurizr operations use a single, consistent interface.
- The project is insulated from the EOL of the standalone tools.
- The `local` command is a drop-in replacement for Structurizr Lite with the same local authoring workflow.
- Authentication is simplified to a single API key.

**Negative:**
- Docker must be running for any Structurizr operation (local viewing, export, push). Previously, `structurizr-cli` could be installed as a standalone binary without Docker.
- First-time use of each command requires Docker to pull the `structurizr/structurizr` image (~1GB), adding latency.
- Teams using `STCTZR_WORKSPACE_SECRET` in existing `.env-arch` files can safely remove it — the variable is no longer read.

## References

- [Introducing Structurizr vNext](https://www.patreon.com/posts/146923136) — Patreon post announcing the consolidation of all Structurizr tools into the unified image.
- [Structurizr end-of-life page](https://docs.structurizr.com/eol) — Official EOL listing for Structurizr Lite, CLI, on-premises, and cloud service.
- [Structurizr commands reference](https://docs.structurizr.com/commands) — Full list of commands available in the unified `structurizr/structurizr` image.
- [local command reference](https://docs.structurizr.com/local) — Options and examples for the `local` command used in `run.sh`.
