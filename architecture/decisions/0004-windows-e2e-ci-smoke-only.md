# 4. macOS and Windows CI E2E Tests Scoped to Version-Check Smoke Test Only

Date: 2026-04-10

## Status

Accepted

## Context

- The `structurizr/structurizr` Docker image (introduced in ADR 0003) only provides Linux builds (`linux/amd64`, `linux/arm64`). There is no Windows or macOS-compatible Docker image.
- The Scaffoldizr e2e test suite relies on the `structurizr/structurizr` Docker image for most tests (export, run, update scripts).
- GitHub Actions Windows runners (`windows-latest`) cannot run Linux Docker containers without additional tooling (WSL2 + Docker Desktop license or equivalent), which is not available in standard CI environments.
- GitHub Actions macOS runners (`macos-latest`) do not have Docker pre-installed, and neither VZ (Apple Virtualization.framework) nor QEMU-based VM solutions (e.g. Colima) work reliably on these runners due to missing hypervisor support.
- Running the full e2e suite on macOS or Windows CI would require either: (a) a native binary for that platform (which does not exist), (b) a platform-compatible Docker image (which does not exist), or (c) mocking Docker entirely (which would reduce test fidelity).

## Decision

- macOS and Windows CI are both scoped to a single **smoke test**: a version-check only (`scfz --version`) that validates the binary was built and runs correctly on that platform.
- A dedicated npm script `test:e2e:smoke:windows` is used for both macOS and Windows jobs. It runs only `e2e/scfz-general.test.ts`, which contains the `@smoke` tagged version-check test and has zero Docker dependency.
- The `.github/workflows/e2e.yaml` macOS and Windows jobs unconditionally run `test:e2e:smoke:windows`. There is no full e2e path for either platform.
- Linux CI jobs (`ubuntu-latest`) continue to run the full e2e suite with Docker available natively.
- Docker-dependent e2e tests are not tagged `@smoke` and are never run in macOS or Windows jobs.

## Consequences

- Positive: macOS and Windows CI remain fast and reliable — no Docker dependency, no flaky VM/container setup steps.
- Positive: Both macOS and Windows binaries are still validated in CI for every PR (build succeeds + version output correct).
- Positive: No licensing or infrastructure cost for Docker on macOS/Windows CI runners.
- Positive: Full e2e coverage is provided by Linux runners which have native Docker support.
- Negative: Docker-dependent scenarios (export, run, update scripts) are not tested on macOS or Windows in CI. Any platform-specific behaviour differences would only be caught locally or in production.
- Negative: If future macOS or Windows-compatible Structurizr Docker images become available, this ADR should be revisited.

## References

- ADR 0003: Migrate to Unified Structurizr Docker Image
- [structurizr/structurizr Docker Hub](https://hub.docker.com/r/structurizr/structurizr) — Linux-only image manifests
- `.github/workflows/e2e.yaml` — CI workflow with platform-specific e2e steps
- `package.json` `test:e2e:smoke:windows` script
