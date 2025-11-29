# Scaffoldizr Copilot Instructions

## Overview
Scaffoldizr is a TypeScript/Bun CLI tool that generates opinionated scaffolding for Structurizr DSL architecture documentation. It uses a generator-based system with Handlebars templates to create C4 model workspaces.

## Architecture

### Core Components
- **`lib/main.ts`**: CLI entry point using yargs, orchestrates generator selection
- **`lib/generators/`**: Individual generators for workspace elements (system, component, container, etc.)
- **`lib/templates/`**: Handlebars templates bundled via `bundle.ts`, supporting C4 model DSL syntax
- **`lib/utils/generator.ts`**: Core generator framework with action system (add, addMany, append)
- **`lib/utils/actions/`**: File manipulation actions that generators use to create/modify files

### Generator Pattern
All generators follow the same structure:
```typescript
const generator: GeneratorDefinition<AnswersType> = {
    name: "GeneratorName",
    description: "What it creates",
    questions: { /* inquirer prompts */ },
    actions: [/* add/addMany/append actions */]
}
```

### Template System
- Templates are Handlebars files (`.hbs`) in `lib/templates/`
- Bundled into a Map via `bundle.ts` for runtime access
- Support C4 model DSL syntax with custom constants like `!const`, `!include`
- Templates generate `.dsl` files that follow Structurizr workspace structure

## Development Workflow

### Commands
- **Build**: `bun build:dev` (compiles to `./dist/scfz`)
- **Test**: `bun test` (unit tests), `bun test:e2e` (end-to-end with timeout)
- **Watch**: `bun test:dev` or `bun build:watch`
- **Lint/Format**: Uses Biome (`biome.json`) with 4-space indentation

### Testing Strategy
- Unit tests co-located with source files (`.test.ts`)
- E2E tests in `e2e/` directory with separate `e2e.toml` config using CLI subprocess testing
- Test utilities in `lib/utils/` for generator testing
- Coverage reporting via `bun test:ci`

### E2E Testing Suite
- Tests actual CLI behavior by spawning `dist/scfz` subprocess
- Uses keypress simulation for interactive prompts (`keypress.DOWN`, `keypress.ENTER`)
- Smoke test (`@smoke` tag) validates version output
- Tests run with 30-second timeout and bail on first failure
- Environment variables: `INPUT_TIMEOUT` (400ms default), `TMP_FOLDER`, `TESTED_VERSION`

### Pre-commit Hooks
- Husky manages git hooks with user override (`git config custom.hooks.pre-commit false`)
- Pre-commit runs: `bun build:dev`, exports `TESTED_VERSION`, then `bun lint-staged`
- Lint-staged config (`.lintstagedrc.json`):
  - Format/lint all files: `bun biome ci`
  - Run unit + smoke tests on TypeScript changes: `bun test:ci && bun test:e2e:smoke`

### File Structure Conventions
- **Generated workspaces**: `architecture/` folder contains all DSL files
- **Modular DSL**: Uses `!include` directives to split large files
- **Constants**: Defined in workspace root, used across views
- **Relationships**: Separate files for external/system relationships

## Key Patterns

### Generator Actions
- `add`: Create single file from template
- `addMany`: Create multiple files with dynamic names
- `append`: Add content to existing file

### Template Variables
Templates receive answers from generator questions plus computed values:
- File paths use kebab-case naming
- Labels use capitalCase transformation via `labelElementByName()`
- Git user info automatically populated for workspace generator

### C4 Model Integration
- Workspace structure follows Structurizr conventions
- Views include theme references and author constants
- ADRs and docs integration via `!adrs` and `!docs` directives
- Support for all C4 levels: landscape, system, container, component

## Dependencies
- **Runtime**: Inquirer prompts, Handlebars, Chalk, change-case, yargs
- **Build**: Bun as both runtime and bundler
- **Quality**: Biome for formatting/linting, Husky for git hooks
- **Testing**: Bun test runner with coverage support

## Branch Strategy
- Feature branches: `feature/` prefix required by branch-name-lint
- Main development on default branch
- Automated version bumping on tags via GitHub Actions