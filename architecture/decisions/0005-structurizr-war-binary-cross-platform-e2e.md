# 5. Use Structurizr Java WAR Binary for Cross-Platform E2E Tests

Date: 2026-06-09

## Status

Accepted, supersedes [ADR 0004](0004-windows-e2e-ci-smoke-only.md)

## Context

- ADR 0004 scoped macOS and Windows CI E2E tests to a version-check-only smoke test (`scfz --version`) because the `structurizr/structurizr` Docker image has no macOS or Windows support, and GitHub Actions runners for those platforms cannot run Linux Docker containers.
- Structurizr now publishes a prebuilt Java `.war` binary available at a versioned URL (e.g. `https://download.structurizr.com/structurizr-2026.05.22.war`) that runs on any platform with Java 21. The CLI is invoked as `java -jar structurizr.war <command> [parameters]`, providing the same commands as the Docker image.
- The Scaffoldizr `--export` flag, which compiles `workspace.dsl` to `workspace.json`, previously called `docker run ... structurizr/structurizr export`. This is the only Structurizr dependency in the E2E test suite and was the sole reason for restricting macOS and Windows CI to a no-Docker smoke test.
- `lib/utils/structurizr-version.ts` already defines `STRUCTURIZR_LOCKED_VERSION` as the single source of truth for the pinned Structurizr version, used by the CLI when invoking Docker. This same version can be read at CI runtime to pin both the Docker image tag and the WAR download URL, eliminating any version drift between the two.

## Decision

- Introduce a `STCTZR_WAR_PATH` environment variable in the Scaffoldizr CLI (`lib/main.ts`). When set, the `--export` flag invokes `java -jar $STCTZR_WAR_PATH export` instead of `docker run`. When unset, the existing Docker behaviour is preserved for backward compatibility.
- Add `java = "temurin-21"` to `.mise.toml` alongside the existing `bun` and `jq` declarations. `jdx/mise-action` is used unconditionally across all platforms (Linux, macOS, and Windows), replacing the previous per-platform approach of choco on Windows. All tools are now installed from `.mise.toml` via a single step on every runner.
- Add a `prepare` job to `.github/workflows/e2e.yaml` that runs once before the matrix, reads `STRUCTURIZR_LOCKED_VERSION` from `lib/utils/structurizr-version.ts`, and exposes it as a job output (`structurizr_version`). All matrix jobs consume this output, removing any per-platform version extraction logic.
- Use `structurizr_version` to pin the Docker image tag on Linux (`structurizr/structurizr:${{ needs.prepare.outputs.structurizr_version }}`) and to construct the versioned WAR download URL on macOS and Windows.
- Cache the downloaded WAR binary using `actions/cache@v4` with a key of `structurizr-war-{version}`. The cache invalidates automatically when `STRUCTURIZR_LOCKED_VERSION` changes. The download step is skipped on a cache hit.
- macOS and Windows CI jobs now run `test:e2e:smoke` (all `@smoke`-tagged tests) or `test:e2e` (full suite) depending on the `inputs.smoke` workflow flag, fully mirroring the behaviour of Linux jobs. The previous `test:e2e:smoke:windows` script (version-check only) is no longer used in CI.

## Consequences

- Positive: macOS and Windows CI now execute the full `@smoke` test suite or the complete E2E suite (mirroring Linux), including workspace creation and element scaffolding with DSL export, greatly increasing cross-platform coverage.
- Positive: No Docker daemon, WSL2, or hypervisor support is required on macOS or Windows runners.
- Positive: The WAR binary is cross-platform by nature of the JVM; no platform-specific Structurizr binary is needed.
- Positive: `STRUCTURIZR_LOCKED_VERSION` is the single source of truth for the Structurizr version across the CLI, Docker image tag, and WAR download URL. Updating it in one place propagates to all CI platforms automatically.
- Positive: The WAR binary is cached per version, so repeat CI runs on the same version pay no download cost.
- Positive: All tools (bun, java, jq, ruby) are installed via mise from `.mise.toml` on every platform, including Windows. There is no longer a separate Chocolatey installation step, giving developers and CI runners identical tooling setup.
- Positive: Local development is unaffected — `--export` continues to use Docker unless `STCTZR_WAR_PATH` is set.
- Negative: Non-`@smoke` E2E tests are still not run on macOS or Windows when `inputs.smoke` is true; full parity requires `inputs.smoke: false`.

## References

- ADR 0003: Migrate to Unified Structurizr Docker Image
- ADR 0004: macOS and Windows CI E2E Tests Scoped to Version-Check Smoke Test Only
- [Structurizr Binaries](https://docs.structurizr.com/binaries#java-war-file) — WAR binary download and usage documentation
- `.github/workflows/e2e.yaml` — CI workflow with `prepare` job and updated matrix steps
- `.mise.toml` — `java = "temurin-21"` tool declaration
- `lib/main.ts` — `exportWorkspace` function with `STCTZR_WAR_PATH` fallback logic
- `lib/utils/structurizr-version.ts` — `STRUCTURIZR_LOCKED_VERSION` single source of truth
