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

## React project-creation form learning

### One generic handler for many controlled inputs

`projectForm` state starts from an `initialProjectForm` object whose keys mirror the fields `StoreProjectRequest` validates. Every plain text field shares one change handler instead of a separate handler per field:

```js
function handleProjectChange(event) {
  const { name, value } = event.target

  setProjectForm((currentForm) => ({
    ...currentForm,
    [name]: value,
  }))
}
```

This works only because of two separate mechanisms working together:

- `event.target` is the actual DOM element the user just interacted with. Destructuring `name` and `value` off it reads that one element's `name` attribute and current text, whatever field fired the event.
- `[name]` in the object literal is a *computed property name*. Square brackets tell JavaScript to use the string stored in the variable `name` as the key, not the literal word `name`. `{ name: value }` would always create a key literally called `"name"`; `{ [name]: value }` creates `title`, `github_url`, or whichever field actually changed.

Both pieces are required: `event.target` supplies the string, `[name]` is what turns that string into a real object key. The handler is reusable across every text/textarea input only because each one is given a `name` attribute matching a key already present in `initialProjectForm`.

### Checkboxes need `.checked`, not `.value` — and why they can't share a handler

A checkbox's change event does not behave like a text input's:

- `event.target.value` on a checkbox is not `undefined` — it defaults to the fixed string `"on"`, regardless of whether the box is ticked. There is no way to detect "was this a checkbox or a text field" by checking whether `.value` is set, because it is always set.
- The real ticked/unticked state lives in `event.target.checked`, a genuine boolean.

Because of this, a second handler is required:

```js
function handleProjectCheckboxChange(event) {
  const { name, checked } = event.target

  setProjectForm((currentForm) => ({
    ...currentForm,
    [name]: checked,
  }))
}
```

It reuses the identical `[name]` spread-and-overwrite pattern; the only difference is reading `checked` instead of `value`, because that is the property the browser actually populates for a checkbox. Matching this to `StoreProjectRequest`'s `'is_featured' => ['sometimes', 'boolean']` rule matters: storing the string `"on"` instead of a real boolean would either fail validation or send the wrong data type to the API.

### Wiring the submit handler to a real API call

`handleProjectSubmit` follows the same try/catch/finally shape as `handleLogin`, because both are "call the API, then react to what came back" operations:

```js
try {
  await api.post('/api/projects', payload)
  setProjectForm(initialProjectForm)
  setProjectMessage('Project created successfully.')
} catch (error) {
  if (error.response?.status === 422) {
    setProjectErrors(error.response.data.errors)
    setProjectMessage('Please fix the errors below.')
  } else {
    setProjectMessage('Failed to create project.')
  }
} finally {
  setIsSubmittingProject(false)
}
```

Two things matter here:

- Laravel's `422` response body has the shape `{ message, errors: { field: [messages] } }`. `error.response.data.errors` is that per-field object, stored as-is so it can later be rendered next to each input. Checking `error.response?.status === 422` specifically (rather than treating every error the same) is what lets the form distinguish "you typed something invalid" from "the server or network failed."
- `finally` runs whether the try succeeded or the catch fired, which is why `setIsSubmittingProject(false)` lives there instead of being duplicated at the end of both branches. This is the same reason `isSubmittingProject` disables the button and swaps its label during the request: it is set to `true` before the `try`, not inside it.

Only a form reset on success (not on failure) is correct: a failed submission's data is still wrong and the user needs to see and fix it, not retype it.

### Rendering per-field `422` errors

Once `projectErrors` holds Laravel's `{ field: [messages] }` object, showing one under a specific input is a small, repeatable pattern:

```jsx
{projectErrors.title && <p>{projectErrors.title[0]}</p>}
```

`projectErrors.title` is an array (Laravel always returns an array of messages per field, even for one message), so `[0]` picks the first. The `&&` guard matters because `projectErrors.title` is `undefined` for any field with no error, and `undefined && <p>...</p>` short-circuits to `undefined`, which React renders as nothing, no crash from trying to index into a field that never had an error.

This is the same field-name-must-match-exactly requirement as `htmlFor`/`id` and `name`/state-key: `projectErrors.title` only works because the backend's validation error key and this JSX property access use the identical string `title`.

### Two different triggers for "go refetch the data"

`useEffect(() => { if (user) fetchProjects() }, [user])` only reruns when something in its dependency array actually changes value. It is not a general "something happened" watcher, it watches one specific variable. Creating a project does not change `user` at all (same logged-in person before and after), so this effect has no reason to fire again after a create, the same way a smoke detector doesn't react to a door slamming.

Because of that, a second, independent trigger is needed: a direct call to `fetchProjects()` written as the next line after a successful `api.post()` inside `handleProjectSubmit`. This isn't reacting to a dependency change, it's an explicit "this specific event means the data is now stale" instruction. Two different events (login succeeding vs. a create succeeding) need two different triggers, because only one of them touches `user`.

### The `key` prop when rendering a list

```jsx
{projects.map((project) => (
  <li key={project.id}>
```

React needs a stable, unique `key` on each item in a rendered list so it can track which DOM element corresponds to which array item across re-renders, otherwise it can misattribute state or content between items after the list changes (a create, a delete, a reorder). `project.id` from the database is a correct choice: guaranteed unique and stable, unlike using the array index, which shifts if items are added, removed, or reordered.

### Label `htmlFor` must match input `id` exactly, or accessibility tooling breaks silently

A `<label htmlFor="github-url">` paired with `<input id="github_url">` renders with no visible error, the page looks completely normal. The mismatch only surfaces as a DevTools accessibility warning ("Incorrect use of `<label for=FORM_ELEMENT>`"), because the browser can no longer connect that label to that input for screen readers or click-to-focus. The fix is exact string equality between the two attributes, nothing more. This is easy to introduce because hyphenated and underscored versions of the same field name both look plausible at a glance.

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
- `npm run format` (Prettier) rewrites indentation, blank lines, and quote/semicolon style automatically. This is the frontend equivalent of Pint: it fixes how code looks, not whether it is correct. A real bug (like a mismatched `id`/`htmlFor`) still needs a human or a different tool to catch it.

### Git checks

- `git diff --check` detects whitespace errors.
- CRLF/LF messages on Windows are line-ending warnings, not automatically code failures.
- local Git history and the GitHub remote are different; uncommitted local work cannot be recovered from GitHub.

## Concepts to reinforce next

- authorization policies and roles if more than one user type is introduced
- project show, update, and delete endpoints
- route-model binding
- update-specific validation
- backend `show`, `update`, `destroy` endpoints with feature tests
- splitting `App.jsx` into separate components as the interface grows
- an admin-specific listing that includes unpublished projects (current list reuses the public, published-only endpoint)
- API resource classes
- image upload and storage
- CI/CD
- production deployment and environment configuration
