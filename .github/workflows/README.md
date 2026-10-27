# Workflow Architecture

Every workflow in this directory has exactly one job type: **run when it is supposed to, and finish green**. No job is ever shown as "skipped", and no workflow runs code scanning that the repository plan cannot support.

## Pipeline layers

| Layer | Workflow | Trigger | Purpose | Duration |
|---|---|---|---|---|
| **PR gate (fast)** | `ci.yml` (`CI`) | PR → `main`/`develop`, push to `main`/`develop` | Lint, type check, unit tests, coverage — frontend + backend | ~5 min |
| **Security** | `security-scan.yml` (`Security Scan`) | PR, push, weekly schedule | `npm audit` / .NET vulnerable-dependency scan + secret detection | ~3 min |
| **Post-merge deep** | `backend-integration.yml` | push to `main`/`develop` (Backend paths) | Integration tests against SQL Server via Testcontainers | ~8–12 min |
| **Post-merge deep** | `e2e.yml` (`E2E Tests`) | push to `main`/`develop` (Frontend/Backend paths) | Full Playwright browser suite, cached browsers | ~10–15 min |
| **Post-merge deep** | `docker.yml` (`Docker Build Verification`) | push to `main`/`develop` | Builds both Docker images with layer caching | ~5–10 min |
| **Scheduled** | `security-audit.yml` | weekly + dependency-file changes | Deep dependency audit (review-ready SARIF output) | weekly |
| **Deploy** | `deploy.yml` (`Deploy`) | push to `main`, manual | Vercel (frontend) + Azure (backend) — each phase only runs when its credentials are configured | on demand |
| **Housekeeping** | `stale.yml` | daily schedule | Marks and closes stale issues/PRs | daily |

## Design rules

1. **Fast PR gate.** Pull requests run only the cheap, deterministic checks. Everything expensive (Testcontainers SQL Server, Playwright browsers, Docker builds) is a **separate workflow triggered on push to `main`/`develop`** — it never appears on PR check lists, so nothing is ever "skipped" and PRs stay fast.
2. **No conditional job gating inside a workflow.** Jobs with runtime `if:` conditions show up as "skipped" rows in the UI. Instead, a job either belongs in a workflow whose trigger guarantees it runs, or it does not exist.
3. **Optional integrations degrade silently.** Codecov uploads and deploy credentials are checked inside a *step* (the `secrets` context is not available in job-level `if:`), not at job level. Missing credentials ⇒ info message, green run.
4. **Concurrency everywhere.** Every workflow cancels superseded runs on the same ref to save minutes.
5. **Caching everywhere.** npm (`setup-node cache`), NuGet (`actions/cache`), Playwright browsers (version-keyed), Docker layers (Buildx GHA cache).

## Removed

- **`codeql.yml` — deleted.** This repository is private and does not have GitHub Advanced Security; CodeQL uploads fail with `Advanced Security must be enabled for this repository to use code scanning`, which made every run red. Vulnerability scanning continues via `security-scan.yml` (dependencies + secrets). **To re-enable CodeQL:** purchase/enable GitHub Advanced Security, then restore `codeql.yml` (it needs `security-events: write` and the init/analyze actions from git history).
