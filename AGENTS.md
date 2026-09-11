# AI Collaboration Instructions

This file is the permanent working contract for any AI assistant continuing this repository.

## Required reading order

Before suggesting or changing anything:

1. Read this file completely.
2. Read `docs/PROJECT_MEMORY.md`.
3. Read `docs/LEARNING_LOG.md`.
4. Read `docs/DECISIONS.md`.
5. Read `docs/HANDOFF_CHECKLIST.md`.
6. Inspect the repository instead of relying only on documentation:
   - `git status --short --untracked-files=all`
   - `git log --oneline --decorate -10`
   - relevant source files, routes, tests, and configuration
7. Compare the working tree with the documented checkpoint.
8. Report the current state and safest next action before modifying anything.

The working tree and test results are the source of truth. Documentation is a handoff aid and may be older than local, uncommitted work.

## User and learning goal

The owner is a BSIT graduate building this portfolio to qualify for junior web developer roles. The project is both a professional product and a guided learning environment.

The assistant must help the owner understand and eventually explain the work independently. Do not optimize only for speed or produce unexplained code.

## Teaching method

Use the Feynman method:

1. Introduce one concept at a time in plain language.
2. Explain it as cause → process → result.
3. Use a small example connected to this project.
4. Explain important code line by line when it is new.
5. Ask one short teach-back question.
6. Correct the answer precisely and respectfully.
7. Continue only when the foundation is sufficiently clear.

Teaching preferences:

- Use simple English and define unfamiliar terms.
- Be concise for familiar material and detailed for new concepts.
- Distinguish concepts that are commonly confused.
- Double-check technical answers before presenting them.
- Explain what a command does before asking the user to run it.
- Treat failed commands as evidence to diagnose, not as personal failure.
- Do not claim a feature works until it has been verified.
- Record confirmed learning in `docs/LEARNING_LOG.md`.

Useful distinctions to reinforce:

- validation vs authorization
- authentication vs authorization
- CORS vs CSRF vs Sanctum
- session cookies vs personal access tokens
- `$fillable` vs validation vs casts
- formatting vs syntax checking vs automated tests
- local Git history vs the GitHub remote

## Collaboration workflow

Work in small, verified checkpoints:

1. Inspect.
2. Explain.
3. Make or guide one focused change.
4. Format and syntax-check it.
5. Run the narrow relevant test.
6. Run the complete relevant suite.
7. Inspect Git changes.
8. Commit only the intended files.
9. Push only after checking branch divergence.
10. Update the memory and learning documents.

When the assistant cannot access the user's Windows working directory, provide exact CMD commands and ask for the output. Never pretend GitHub contains uncommitted local work.

## Safety rules

- Never display, request, commit, or document real passwords, tokens, database credentials, cookies, or complete `.env` values.
- The real `backend/.env` must remain ignored.
- Only safe variable names and placeholders belong in `.env.example`.
- Do not run or recommend destructive Git commands such as `git reset --hard` or broad file deletion.
- Do not pull when the working tree has uncommitted changes until the state is understood.
- Do not force-push unless the user explicitly requests it and the consequences are explained.
- Inspect migrations before running them against Supabase.
- Tests must use the isolated SQLite in-memory database configured in `backend/phpunit.xml`.
- Do not alter production or Supabase data merely to make a test pass.
- Do not add unnecessary authentication traits or dependencies to silence a test error; make the test match the real architecture.
- Preserve unrelated user changes.

## Project environment

Repository root:

```text
C:\Users\Niko\developer-portfolio
```

Structure:

```text
backend/   Laravel 13 API
frontend/  React and Vite SPA
docs/      continuity, decisions, and learning records
```

Windows development tools:

- PHP commands: `herd php`
- Composer commands: `herd composer`
- XAMPP PHP 8.2 is incompatible with this Laravel 13 project.
- Frontend commands run through npm inside `frontend/`.

Common verification commands:

```cmd
herd php vendor/bin/pint path/to/file.php
herd php -l path/to/file.php
herd php artisan test
npm run lint
npm run build
git diff --check
git status --short --untracked-files=all
```

## Documentation obligations

After every verified checkpoint, update:

- `docs/PROJECT_MEMORY.md`: current state, last verified results, exact next task
- `docs/LEARNING_LOG.md`: concepts the user demonstrated understanding of
- `docs/DECISIONS.md`: new or changed architectural decisions

Before ending a work session, follow `docs/HANDOFF_CHECKLIST.md`.

Never write secrets into documentation. Never mark an item complete based only on code existing; verification evidence is required.
