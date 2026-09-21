# Learning Log

> A durable record of concepts the project owner has learned and explained in their own words. Update this file after understanding is demonstrated, not merely after code is copied.

## Learning approach

The project uses the Feynman method:

1. Learn one concept.
2. Explain it simply.
3. Find and correct gaps.
4. Apply it in the project.
5. Verify it with a command, manual check, or automated test.

## Confirmed foundations

### Migration

A migration is a version-controlled blueprint for creating or changing database structure. The projects migration defines the columns, types, defaults, and unique slug constraint.

### Model

An Eloquent model is Laravel's interface for reading and writing records in a database table.

### Mass assignment and casts

- `$fillable` controls which fields may be mass-assigned.
- validation checks whether submitted values are acceptable.
- `casts()` converts database values into useful PHP types.

These responsibilities are related but not interchangeable.

### Route, controller, model, and response

A route connects an HTTP request to a controller method. The controller coordinates the operation, the model communicates with the database, and Laravel returns a response such as JSON.

### Public project query

`GET /api/projects` returns only projects where `is_published = true`, ordered by `display_order`. An empty JSON array `[]` is a successful response when no published records match.

## Project validation

### Validation vs authorization

- Validation asks: “Is the submitted data acceptable?”
- Authorization asks: “May this user perform this action?”

If a Form Request's `authorize()` returns false, Laravel returns `403 Forbidden`, validation does not continue, and the controller is not executed.

### Form Request

`StoreProjectRequest` validates project data before `ProjectController@store` runs. Calling `$request->validated()` returns only fields covered by the rules that passed validation.

### Important rules

- `required`: must be present and not empty
- `string`: must be text
- `max`: limits text length
- `array`: must be a list
- `min:1`: an array must contain at least one item
- `tech_stack.*`: validates every item inside the array
- `nullable`: may be null, but must follow the other rules when supplied
- `sometimes`: validate only when the field is present
- `boolean`: must represent true or false
- `integer|min:0`: must be a non-negative whole number
- `url`: must be a valid URL

## Slugs and project creation

A slug converts a title into a readable URL-friendly identifier:

```text
Portfolio System → portfolio-system
```

The slug is unique so one URL identifies one project. The controller keeps the original base slug and increments a counter until it finds an unused value:

```text
portfolio-system
portfolio-system-2
portfolio-system-3
```

`ProjectController@store`:

1. receives already authorized and validated data
2. creates a base slug from the title
3. finds an unused slug
4. adds the slug to the validated data
5. creates the project
6. returns JSON with HTTP `201 Created`

`201` communicates that a new resource was created; `200` is a general successful response.

## Authentication and browser security

### Authentication vs authorization

- Authentication asks: “Who is this user?”
- Authorization asks: “May this authenticated user perform this action?”

### Sanctum stateful SPA authentication

This project uses browser-session authentication, not personal access tokens.

```text
React requests a CSRF cookie
→ React submits email and password to /login
→ Laravel verifies the credentials
→ Laravel regenerates the session
→ the browser stores and returns the session cookie
→ auth:sanctum recognizes the authenticated session
```

`statefulApi()` allows Sanctum to recognize first-party SPA requests that use session cookies. It does not log in the user by itself.

### Login and authenticated-user endpoints

- `POST /login` validates credentials and creates an authenticated session.
- `GET /api/user` proves that the saved session is recognized and returns the current user.
- Login checks the credentials; `/api/user` checks the resulting session.

### Logout

`POST /logout` logs out the web guard, invalidates the old session, regenerates the CSRF token, and returns `204 No Content`.

### Status codes

- `401 Unauthenticated`: no valid authenticated identity was supplied
- `403 Forbidden`: identity is known but the action is not allowed
- `422 Unprocessable Content`: submitted data failed validation

Possessing a Laravel cookie does not necessarily mean it represents an authenticated user.

### CORS, CSRF, and Sanctum

- CORS decides whether the browser may expose a cross-origin response to the React origin.
- CSRF protection proves that a state-changing request came from the expected browser context.
- Sanctum authenticates the session or token.

Allowing `http://localhost:5173` through CORS does not log in the user. Credential support permits cookies to travel; the cookie must still identify a valid authenticated session.

## React authentication learning

### Axios client

The shared Axios client provides:

- Laravel base URL
- JSON response preference
- credentials on cross-origin requests
- automatic XSRF header support

### React login sequence

```text
get CSRF cookie
→ post credentials
→ request /api/user
→ store returned user in React state
→ render authenticated interface
```

### Session restoration with useEffect

React state disappears after a browser refresh, but the session cookie may remain. On initial render, `useEffect` requests `/api/user`. If Laravel recognizes the session, React restores the user state; otherwise it displays the login form.

### Logout state

After Laravel destroys the session, React clears its local `user` state. Refreshing remains logged out because the old server session is invalid.

## Development tools and verification

### Pint

Laravel Pint formats PHP code consistently. It fixes style such as indentation, import ordering, braces, and spacing. It does not prove business logic is correct.

### PHP syntax check

`herd php -l file.php` checks whether PHP can parse the file. It detects syntax errors but does not verify application behavior.

### Automated tests

Feature tests simulate requests internally and assert responses and database results.

Current authentication tests verify:

- guest rejection
- successful login and protected user access
- incorrect credential rejection
- logout

Current project API tests verify:

- guest cannot create a project
- authenticated session can create a project
- duplicate titles receive unique slugs
- invalid data is rejected

`RefreshDatabase` gives each test clean database state. The project test environment uses SQLite `:memory:`, so these tests do not modify Supabase.

### Session helper vs token helper

For this stateful SPA, `$this->actingAs($user)` correctly simulates a session-authenticated user.

`Sanctum::actingAs($user)` simulates Sanctum token authentication and expects token-related behavior such as `withAccessToken()`. The earlier test failure taught that the testing helper must match the real architecture.

### Frontend checks

- `npm run lint` checks frontend code rules.
- `npm run build` proves Vite can create a production bundle.

### Git checks

- `git diff --check` detects whitespace errors.
- CRLF/LF messages on Windows are line-ending warnings, not automatically code failures.
- local Git history and the GitHub remote are different; uncommitted local work cannot be recovered from GitHub.

## Full CRUD and dashboard concepts

### Implicit route-model binding

Typing a controller parameter as `Project $project` instead of `string $id` tells Laravel to look up the model by the route segment automatically. An id that matches no row 404s before the controller method body runs at all, which is why `show`, `update`, and `destroy` no longer need a manual "not found" check for a bad id.

### Partial update validation with `sometimes`

`StoreProjectRequest` requires every field because a new project has nothing yet. `UpdateProjectRequest` marks every field `sometimes` (validate only if present) plus `required` when it is present, so a `PUT` that only sends `is_published` doesn't fail validation for missing `title` or `description`.

### Conditional slug regeneration

The store endpoint always builds a fresh slug. The update endpoint only rebuilds it when the incoming `title` differs from the project's current title — otherwise editing the description would silently change the project's URL, breaking any link someone already saved.

### `key` resets React state instead of an effect

`ProjectForm` used to copy `editingProject` into local state inside a `useEffect`. React's own guidance is to avoid that pattern: instead, `AdminDashboard` renders `<ProjectForm key={editingProject?.id ?? 'new'} .../>`. Changing the `key` tells React to throw away the old component instance and mount a new one, so the form's `useState` initializer runs fresh with no effect needed. This also happens to be exactly what `oxlint`'s `set-state-in-effect` rule was warning about.

### Admin-only listing vs public listing

`GET /api/projects` (public) filters to `is_published = true` because visitors should only ever see finished work. `GET /api/admin/projects` (protected by `auth:sanctum`) returns every row regardless of publish state, because the administrator needs to see and edit drafts before they go live. Same table, two different queries for two different audiences — that is authorization expressed as a query filter, not just a route guard.

## Concepts to reinforce next

- authorization policies and roles if more than one user type is introduced
- API resource classes (to control exactly what JSON shape leaves the API, instead of returning the raw model)
- image upload and storage
- CI/CD
- production deployment and environment configuration
- manual browser verification of the admin dashboard against real Supabase data (not yet done — see `docs/PROJECT_MEMORY.md`)
