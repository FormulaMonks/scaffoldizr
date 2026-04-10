# 4. Windows CI E2E Tests Scoped to Version-Check Smoke Test Only

Date: 2026-04-10

## Status

Accepted

## Context

- The `structurizr/structurizr` Docker image (introduced in ADR 0003) only provides Linux builds (`linux/amd64`, `linux/arm64`). There is no Windows-compatible Docker image.
- The Scaffoldizr e2e test suite relies on the `structurizr/structurizr` Docker image for most tests (export, run, update scripts).
- GitHub Actions Windows runners (`windows-latest`) cannot run Linux Docker containers without additional tooling (WSL2 + Docker Desktop license or equivalent), which is not available in standard CI environments.
- Running the full e2e suite on Windows CI would require either: (a) a native Windows Structurizr binary (which does not exist), or (b) a Windows-compatible Docker image (which does not exist), or (c) mocking Docker entirely (which would reduce test fidelity).

## Decision

- Windows CI is scoped to a single **smoke test**: a version-check only (`scfz --version`) that validates the binary was built and runs correctly on Windows.
- A dedicated npm script `test:e2e:smoke:windows` is added to `package.json`. It runs only `e2e/scfz-general.test.ts`, which contains the `@smoke` tagged version-check test and has zero Docker dependency.
- The `.github/workflows/e2e.yaml` Windows job unconditionally runs `test:e2e:smoke:windows`. There is no full e2e path for Windows.
- macOS and Linux CI jobs continue to run the full e2e suite (with Docker available via Colima on macOS, and natively on Linux runners).
- Docker-dependent e2e tests are not tagged `@smoke` and are never run in the Windows job.

## Consequences

- Positive: Windows CI remains fast and reliable — no Docker dependency, no flaky Docker setup steps.
- Positive: The Windows binary is still validated in CI for every PR (build succeeds + version output correct).
- Positive: No licensing or infrastructure cost for Docker on Windows CI runners.
- Negative: Docker-dependent scenarios (export, run, update scripts) are not tested on Windows in CI. Any Windows-specific Docker behaviour differences would only be caught locally or in production.
- Negative: If a future Windows-compatible Structurizr Docker image becomes available, this ADR should be revisited to enable full e2e on Windows.

## References

- ADR 0003: Migrate to Unified Structurizr Docker Image
- [structurizr/structurizr Docker Hub](https://hub.docker.com/r/structurizr/structurizr) — Linux-only image manifests
- `.github/workflows/e2e.yaml` — CI workflow with platform-specific e2e steps
- `package.json` `test:e2e:smoke:windows` script
