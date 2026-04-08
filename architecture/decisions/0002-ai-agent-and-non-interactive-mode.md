# 2. Support AI Agent and Non-Interactive Mode

Date: 2026-04-08

## Status

Accepted

## Context

Scaffoldizr was originally designed as a fully interactive CLI tool, relying on Inquirer.js prompts to guide users through workspace and element creation. This worked well for human operators but made the tool unusable in automated contexts.

As AI-assisted development workflows became common, agents (such as LLM-based coding assistants) needed to generate and evolve architecture documentation programmatically. These agents cannot interact with TTY-based prompts and require all inputs to be provided upfront as CLI flags.

Additionally, the rise of standardized agent skill formats (e.g., OpenCode / Claude skills) created an opportunity to package Scaffoldizr's conventions and generator knowledge into a reusable agent skill, enabling AI assistants to invoke the tool correctly without human guidance.

## Decision

We will extend the CLI to support non-interactive execution by:

1. **Subcommand routing** — when a `workspace.dsl` already exists, the desired generator can be passed as a positional subcommand (e.g., `scfz container`), bypassing the interactive main menu.
2. **Flag-based answers** — all Inquirer prompt questions can be answered via CLI flags using `--parameter "value"` format. When all required flags are present, no prompts are shown.
3. **AI Agent Skill** — a structured skill file (`.claude/skills/scaffoldizr/SKILL.md`) is shipped with the repository, providing AI agents with conventions, element creation rules, workspace scope constraints, and CLI usage patterns.

The interactive mode remains fully supported and is unchanged. Non-interactive mode is strictly additive.

## Consequences

**Positive:**
- AI agents and automation scripts can drive the full Scaffoldizr workflow without human input.
- The agent skill codifies existing conventions, reducing the risk of agents generating invalid or inconsistent DSL.
- CI pipelines can scaffold architecture elements as part of automated workflows.
- The tool surface area for human users is unchanged — interactive mode is unaffected.

**Negative:**
- CLI flag names are tightly coupled to Inquirer prompt `name` fields. Renaming a prompt question is now a breaking change for any automation that targets that flag.
- Non-interactive mode does not validate flag completeness upfront — missing required flags fall back to interactive prompts, which will hang in a non-TTY context.
- The agent skill file must be kept in sync with generator changes manually; there is no automated validation that the skill reflects current CLI behaviour.
