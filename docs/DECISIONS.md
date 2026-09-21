# Technical Decisions

> Records important architectural choices and why they were made. Update an entry when a decision changes instead of silently replacing its history.

## Application structure

### Separate `backend/` and `frontend/`

**Decision:** Keep Laravel and React in separate top-level directories.

**Reason:** Their responsibilities and development commands remain clear while both applications share one repository and Git history.

## Backend and database

### Laravel owns application logic

**Decision:** Laravel handles routes, validation, authentication, business logic, and database access.

**Reason:** Supabase is used as hosted PostgreSQL infrastructure, not as a replacement for the Laravel application layer.

### Supabase PostgreSQL with a dedicated `laravel` schema

**Decision:** Store application tables in the `laravel` schema through the Supabase Session pooler with SSL required.

**Reason:** The schema separates portfolio tables from Supabase-managed schemas. The Session pooler provides a compatible external connection.

### Herd PHP for backend commands

**Decision:** Use `herd php` and `herd composer`.

**Reason:** Laravel 13 requires PHP 8.3 or newer. Herd provides PHP 8.4, while plain commands may use incompatible XAMPP PHP 8.2.

## Project data

### JSON for `tech_stack`

**Decision:** Store each project's technology list as JSON and cast it to a PHP array.

**Reason:** A project can have a flexible number of technologies without a separate table at the current portfolio scale.

**Revisit when:** Technology records require global filtering, relationships, aliases, or independent management.

### Server-generated unique slugs

**Decision:** Generate the slug in `ProjectController@store` from the validated title and append `-2`, `-3`, and so on when needed.

**Reason:** The backend remains the authority for URL identifiers and guarantees the unique database constraint is respected.

**Known future concern:** The current existence-check loop is suitable for a personal single-admin portfolio. If concurrent creation becomes possible, handle unique-constraint race conditions explicitly.

### Public reads, protected writes

**Decision:** Keep `GET /api/projects` public and protect `POST /api/projects` with `auth:sanctum`.

**Reason:** Visitors need published project data without authentication, while project modification must be restricted to the administrator.

## Authentication and browser security

### Sanctum stateful SPA sessions

**Decision:** Authenticate the React SPA using Laravel's session cookie through Sanctum's stateful API support.

**Reason:** The application is a first-party browser SPA. Secure, HTTP-only session cookies are more appropriate than storing bearer tokens in browser JavaScript.

### Login and logout use web middleware

**Decision:** Define `POST /login` and `POST /logout` in `routes/web.php`.

**Reason:** These routes need Laravel's session and CSRF middleware. API project routes remain in `routes/api.php`.

### Session regeneration after login

**Decision:** Regenerate the session after successful credential authentication.

**Reason:** This reduces session-fixation risk.

### Session invalidation on logout

**Decision:** Log out the web guard, invalidate the session, and regenerate the CSRF token.

**Reason:** The previous authenticated session and CSRF token should no longer be reusable.

### Exact frontend CORS origin with credentials

**Decision:** Read the allowed React origin from `FRONTEND_URL` and enable credential support.

**Reason:** Credentialed browser requests cannot safely use a wildcard origin. CORS permission allows browser communication but does not authenticate the user.

### Environment-backed admin seeding

**Decision:** Read admin name, email, and password from ignored environment values through `config/admin.php`, validate them, and use `updateOrCreate`.

**Reason:** No real credential belongs in source control. Re-running the seeder updates one administrator instead of creating duplicates. The User model's hashed password cast protects the stored password.

## Validation

### Dedicated Form Requests

**Decision:** Use `LoginRequest` and `StoreProjectRequest`.

**Reason:** Validation and request authorization remain separate from controller coordination logic.

### Store authorization requires an authenticated user

**Decision:** `StoreProjectRequest::authorize()` checks that `$this->user()` is not null.

**Reason:** The route middleware performs the first authentication gate, and the Form Request prevents unauthenticated creation if it is reused elsewhere.

**Future improvement:** If multiple authenticated user roles are introduced, replace this check with a policy or explicit administrator permission.

## Frontend HTTP layer

### Shared Axios instance

**Decision:** Centralize the base URL, credentials, XSRF handling, and JSON acceptance in `frontend/src/api.js`.

**Reason:** Components should not repeatedly implement security-sensitive request configuration.

### Verify the session through `/api/user`

**Decision:** After login and on initial React render, request the protected current-user endpoint.

**Reason:** React should treat Laravel's session as the authentication source of truth instead of assuming that local component state proves authentication.

## Testing

### SQLite in-memory database

**Decision:** Backend tests use the `phpunit.xml` SQLite `:memory:` configuration.

**Reason:** Tests run quickly and never modify Supabase development data.

### Session-authenticated test helper

**Decision:** Use `$this->actingAs($user)` for stateful SPA feature tests.

**Reason:** It matches the application's browser-session architecture. `Sanctum::actingAs()` models token authentication and expects token behavior the current User model does not need.

### Verification gates

**Decision:** A checkpoint requires relevant formatting, syntax checks, focused tests, full tests, frontend lint/build when applicable, and Git inspection.

**Reason:** Code existence alone is not evidence that a feature works.

## Version control and handoff

### Code and documentation checkpoints

**Decision:** Publish verified code first, then update continuity documentation through a reviewable documentation branch when appropriate.

**Reason:** Remote documentation changes must not overwrite or complicate uncommitted local work.

### No secrets in Git

**Decision:** Commit `.env.example` placeholders only. Keep the real `backend/.env` ignored.

**Reason:** Git history is permanent and may later become public.

## Full CRUD and admin interface

### Route-model binding for show, update, destroy

**Decision:** Type-hint `Project $project` on `show`, `update`, and `destroy` instead of a raw `string $id`.

**Reason:** Laravel resolves the model and 404s automatically on an unmatched id, removing a manual lookup-or-fail branch from every write action.

### Slug regenerates only when the title changes

**Decision:** `update()` rebuilds the unique slug only if the validated `title` differs from the project's stored title.

**Reason:** A project's URL should stay stable across edits that don't touch the title. Regenerating on every update would silently break any bookmarked or shared link.

### Separate public and admin listing endpoints

**Decision:** Keep `GET /api/projects` filtered to published rows, and add a distinct `GET /api/admin/projects` behind `auth:sanctum` that returns every row.

**Reason:** The dashboard needs to show and edit drafts; visitors must never see them. Two endpoints keep that boundary explicit in the route table instead of hiding it behind a conditional inside one shared endpoint.

### One React form for create and edit, reset via `key`

**Decision:** `ProjectForm` takes an optional `editingProject` prop and derives its initial state directly from it; `AdminDashboard` forces a remount with `key={editingProject?.id ?? 'new'}` when the selection changes, instead of syncing props into state inside a `useEffect`.

**Reason:** Avoids the "derived state that needs an effect to stay in sync" anti-pattern, keeps the form's internal state simpler, and matches React's documented guidance for this exact situation.

### No router library

**Decision:** Toggle between the public page and the admin dashboard with a single piece of state in `App.jsx`, not `react-router` or another routing library.

**Reason:** The whole application is one page with two views and no deep-linkable sub-routes yet. Adding a router now would be a dependency with no corresponding need.

**Revisit when:** Individual projects need their own shareable URL, or the admin area grows enough sub-pages to justify real routes.

### Frontend visually matches the `nickos8/portfolio` repo

**Decision:** Port the color tokens (dark/light CSS variables), the `Inter` + `JetBrains Mono` font pairing, and the card/pill/tag/button class patterns from the static `portfolio` repo into this app's `index.css`/`App.css`, rather than inventing a new visual language.

**Reason:** The two repos represent the same person's public presence; visitors clicking through should not experience a jarring style change between the static portfolio and this CRUD-driven one.

**Known limitation:** Full end-to-end browser verification against the real Supabase database was not possible in the session that built this — no network path to Supabase was available. Automated backend tests (SQLite) and frontend lint/build stood in for it. A manual pass is still owed before calling this feature done in `docs/PROJECT_MEMORY.md`'s stricter sense.

## Profile and skills

### `profiles` is a one-row table, enforced by the controller, not the schema

**Decision:** No unique constraint or fixed id forces `profiles` to hold one row. `ProfileController@update` does `Profile::first() ?? new Profile` and saves it; there is currently exactly one administrator, so there is exactly one profile in practice.

**Reason:** Simplest thing that works for a single-admin portfolio; adding a real singleton constraint (a fixed id, a DB-level check) would be solving a problem that doesn't exist yet.

**Revisit when:** More than one admin user is introduced, or a race between two simultaneous first-saves becomes a real risk instead of a theoretical one.

### `GET /api/profile` wraps the result in `{"profile": ...}`

**Decision:** Return `{"profile": Profile::first()}` instead of the bare model (which would be `null` when no profile exists).

**Reason:** Verified with `php artisan tinker` that `response()->json(null)` actually serializes to `{}`, not `null`, on the wire. An empty object is truthy in JavaScript, so a bare response would have made "no profile yet" indistinguishable from "profile exists with empty fields" on the frontend. Wrapping the key sidesteps the ambiguity entirely — `response.data.profile` is either an object or `null`, unambiguously.

### Skills have no publish flag

**Decision:** Every skill created through `POST /api/skills` is immediately visible on the public page; there is no `is_published` column on `skills`.

**Reason:** A skill is a name and an optional category — there's no unfinished-draft state worth modeling, unlike a project that might have half-written copy. Adding a publish flag here would be complexity without a real use case.

## Deployment direction

### Planned combined-origin deployment

**Decision status:** Planned, not implemented.

**Current direction:** Serve the built React application and Laravel backend from one deployment origin, with Supabase PostgreSQL remaining hosted.

**Reason:** A shared top-level domain simplifies Sanctum stateful cookie authentication and avoids unrelated-domain cookie limitations.

**Revisit before deployment:** Confirm the current free hosting limits, filesystem behavior, PHP runtime, build process, environment variables, HTTPS, session storage, and image storage.
