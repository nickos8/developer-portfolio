# Deployable Duplicate

A separate, finished copy of this project lives at
[`nickos8/developer-portfolio-deploy`](https://github.com/nickos8/developer-portfolio-deploy).

This repository (`developer-portfolio`) is unaffected and remains the
guided learning project described in `AGENTS.md` -- nothing here changed
as a result of creating that duplicate.

## What the duplicate has that this repository doesn't (yet)

Per the roadmap in `docs/PROJECT_MEMORY.md` §11, the duplicate completes
everything that was still open at the time it was created:

- Project `show`, `update`, `destroy`, and cover-image upload endpoints
  (this repo's `ProjectController` still has empty stubs for these)
- A React admin dashboard for full CRUD, wired to those endpoints
- The public-facing site (hero, about, skills, projects, contact, resume
  link), with all content centralized in one placeholder-filled file for
  easy personalization
- A combined-origin production setup: one Docker image serving both the
  API and the built React app
- A Render Blueprint, a deployment walkthrough (`DEPLOYMENT.md`), and a
  CI workflow

## Why a duplicate instead of finishing this repository directly

The owner asked for a version they could deploy immediately without going
through the step-by-step teaching workflow this repository is intentionally
built around (see `AGENTS.md`). Making a separate repository let that
happen without skipping or rushing the learning process here.

## If you want to bring any of that work back into this repository

Treat the duplicate as reference, not something to merge wholesale --
review each piece against this repository's own state first (per
`AGENTS.md` §"Required reading order" and §"Collaboration workflow"), and
continue teaching the underlying concepts as it's incorporated rather than
copying it in unexplained.
