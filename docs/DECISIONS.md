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

### Prettier for frontend formatting

**Decision:** Add Prettier (`singleQuote: true`, `semi: false`, via `.prettierrc.json`) as a dev dependency with an `npm run format` script.

**Reason:** `oxlint` catches code-quality problems (unused variables, rule violations) but does not rewrite formatting. The frontend had no automated formatter, so indentation and blank-line drift accumulated across manual edits. Prettier gives the frontend the same "run one command, formatting is fixed" workflow Pint already gives the backend. Settings match the style already used in `App.jsx` (single quotes, no semicolons) rather than Prettier's own defaults.

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

## Deployment direction

### Planned combined-origin deployment

**Decision status:** Planned, not implemented.

**Current direction:** Serve the built React application and Laravel backend from one deployment origin, with Supabase PostgreSQL remaining hosted.

**Reason:** A shared top-level domain simplifies Sanctum stateful cookie authentication and avoids unrelated-domain cookie limitations.

**Revisit before deployment:** Confirm the current free hosting limits, filesystem behavior, PHP runtime, build process, environment variables, HTTPS, session storage, and image storage.
