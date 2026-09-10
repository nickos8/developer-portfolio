# Developer Portfolio Project Memory

> Permanent technical handoff and resume point.
>
> Future assistant: read `AGENTS.md` and every document it references before changing the project. Inspect the working tree and tests because GitHub cannot contain uncommitted local work. Never document secrets.

**Last updated:** 2026-09-10  
**Repository:** `nickos8/developer-portfolio`  
**Default branch:** `main`  
**Latest verified code commit on `main`:** `a26b3e5` — **Add admin authentication and protected project creation**  
**Latest verified code commit on `claude/portfolio-project-review-absmbr` (unmerged):** `2c67a2d` — **Display per-field validation errors on the project form**  
**Current phase:** Authenticated Projects CRUD; the project-creation form is functionally complete — wired to the API, shows a generic banner and per-field messages on `422`, resets and confirms on success. Manually verified end to end in the browser.  
**Next exact feature:** Decide between (a) fetching and displaying the existing project list after creation, giving the form a visible feedback loop, or (b) starting the backend `show`/`update`/`destroy` endpoints to round out CRUD. See Section 11 roadmap.  
**Working tree at checkpoint:** `claude/portfolio-project-review-absmbr` clean and synchronized with `origin/claude/portfolio-project-review-absmbr`; not yet merged to `main`

## 1. Purpose

Build a professional full-stack developer portfolio that demonstrates the owner's junior web development skills:

- PHP and Laravel backend development
- React and JavaScript frontend development
- PostgreSQL database design
- REST-style JSON APIs
- CRUD, validation, authentication, and authorization
- automated and manual testing
- Git and GitHub workflow
- technical documentation and independent explanation

Visitors should be able to view published projects. The authenticated administrator should be able to create, update, publish, feature, reorder, and delete projects.

The project is also a learning environment. Follow the teaching contract in `AGENTS.md`.

## 2. Technology and environment

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React 19 with Vite 8 | SPA interface, state, forms, API requests |
| HTTP client | Axios | Shared credentials and XSRF-aware request configuration |
| Backend | Laravel 13 | Routes, validation, authentication, business logic, JSON |
| Authentication | Laravel Sanctum 4.3 | First-party SPA session authentication |
| Database | Supabase PostgreSQL | Persistent application data |
| Tests | PHPUnit/Laravel with SQLite `:memory:` | Isolated backend verification |
| Version control | Git and GitHub | History, backup, review, handoff |

Repository:

```text
developer-portfolio/
├── AGENTS.md
├── backend/
├── frontend/
└── docs/
    ├── PROJECT_MEMORY.md
    ├── LEARNING_LOG.md
    ├── DECISIONS.md
    └── HANDOFF_CHECKLIST.md
```

Windows paths:

```text
C:\Users\Niko\developer-portfolio
C:\Users\Niko\developer-portfolio\backend
C:\Users\Niko\developer-portfolio\frontend
```

Use Herd:

```cmd
herd php
herd composer
```

Plain PHP and Composer may use XAMPP PHP 8.2, which is incompatible with Laravel 13. The verified Herd PHP version is 8.4.24.

## 3. Published checkpoints

### Initialization

- `394e356` — Initialize Laravel 13 and React portfolio project
- Created separate `backend/` and `frontend/` applications
- Initialized Git and confirmed ignores

### Supabase connection

- `15d0a8e` — Configure Supabase PostgreSQL connection
- Connected through the Supabase Session pooler
- Required SSL
- Used a dedicated `laravel` schema
- Kept real environment values out of Git
- Ran and verified Laravel default migrations

### Project database layer

- `2607a9f` — Add Project model and database migration
- Added Project model, fillable fields, and casts
- Created and migrated the projects table
- Verified the unique slug index and table columns

### Public Projects API

- `27318f1` — Add public Projects API endpoint
- Enabled API routing
- Installed Sanctum for later authentication
- Added public `GET /api/projects`
- Filtered to published records
- Ordered by display order
- Manually verified the JSON response

### Project-memory publication

- `5497148` — Mark public Projects API as published
- Recorded the first API checkpoint and safe continuation state

### Authentication and protected project creation

- `a26b3e5` — Add admin authentication and protected project creation
- Added project validation and creation
- Added unique slug generation
- Added Sanctum stateful SPA configuration
- Added login, current-user, and logout behavior
- Added exact credentialed CORS configuration
- Added an environment-backed administrator seeder
- Added the shared Axios client
- Added React login, session restoration, and logout
- Added authentication and project API feature tests
- Verified backend and frontend checks
- Published to `origin/main`

## 4. Projects table

| Column | Purpose |
|---|---|
| `id` | Primary identifier |
| `title` | Display name |
| `slug` | Unique URL-friendly identifier |
| `short_description` | Project-card summary, maximum 300 |
| `description` | Full description |
| `tech_stack` | JSON technology list |
| `github_url` | Optional repository URL |
| `live_url` | Optional deployed URL |
| `image_path` | Optional image location |
| `is_featured` | Featured placement flag |
| `is_published` | Public visibility flag |
| `display_order` | Manual ordering |
| timestamps | Created and updated times |

Model casts:

- `tech_stack` → array
- `is_featured` → boolean
- `is_published` → boolean
- `display_order` → integer

## 5. Current backend behavior

### Public project listing

```text
GET /api/projects
→ ProjectController@index
→ where is_published = true
→ order by display_order
→ JSON collection
```

The endpoint is public. An empty array means the query succeeded but no published projects matched.

### Protected project creation

```text
POST /api/projects
→ auth:sanctum
→ StoreProjectRequest authorization
→ validation
→ unique slug loop
→ Project::create
→ 201 JSON response
```

Validation includes:

- required title, short description, description, and technology list
- per-item technology validation
- nullable valid GitHub and live URLs
- optional booleans for featured and published
- optional non-negative integer display order

Slug example:

```text
Portfolio System → portfolio-system
duplicate → portfolio-system-2
next duplicate → portfolio-system-3
```

### Remaining project controller actions

- `show`: not implemented
- `update`: not implemented
- `destroy`: not implemented
- image upload: not implemented

## 6. Authentication architecture

This is a first-party SPA using Laravel session cookies recognized by Sanctum.

### Middleware

`bootstrap/app.php` enables:

```php
$middleware->statefulApi();
```

This allows stateful SPA requests. It does not log in a user.

### Web authentication routes

- `POST /login`
- `POST /logout`, protected by `auth`

Login:

1. `LoginRequest` validates email and password.
2. `Auth::attempt` checks the credentials.
3. Incorrect credentials return a validation error.
4. The session is regenerated.
5. JSON returns the authenticated user.

Logout:

1. logs out the web guard
2. invalidates the session
3. regenerates the CSRF token
4. returns `204 No Content`

### Protected current-user endpoint

- `GET /api/user`
- protected by `auth:sanctum`
- returns the current authenticated user

### CORS and environment

`config/cors.php` covers API, login, logout, and Sanctum CSRF paths, allows the configured frontend origin, and supports credentials.

Safe placeholders are in `backend/.env.example`:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_URL`

Real values remain only in ignored `backend/.env`.

### Administrator seeder

`AdminUserSeeder`:

1. reads `config('admin')`
2. validates the three values
3. uses `User::updateOrCreate` by email
4. relies on the User model's hashed password cast

The seeder was run successfully and Tinker confirmed the configured administrator exists.

## 7. Current React behavior

### Shared API client

`frontend/src/api.js` configures:

- base URL from `VITE_API_URL`, falling back to local Laravel
- `withCredentials: true`
- `withXSRFToken: true`
- JSON acceptance

Axios is declared in `package.json` and locked in `package-lock.json`.

### Login

```text
GET /sanctum/csrf-cookie
→ POST /login
→ GET /api/user
→ set React user state
```

Wrong credentials display the backend error. Correct credentials display the administrator welcome state.

### Session restoration

On initial render, `useEffect` requests `/api/user` while the interface shows a session-checking state.

- valid session → restore React user state
- missing or invalid session → show login form

This prevents a refresh from losing the authenticated interface while the Laravel session is still valid.

### Logout

The React interface posts to `/logout`, clears its local user state, and returns to the login form. Refreshing after logout remains logged out.

### Next frontend work

The current `App.jsx` is an authentication proof-of-flow, not the final portfolio design.

Next:

1. authenticated project creation form — done
2. controlled inputs for every validated field — done
3. dynamic technology list or a clear initial input strategy — done (comma-separated text input, split/trimmed/filtered into an array on submit)
4. submit through the shared API client — done
5. display Laravel `422` field errors — done (generic banner plus a per-field message under each input)
6. show successful creation response — done
7. refetch or update the project list — not started
8. separate components as the interface grows — not started

### In-progress work: `claude/portfolio-project-review-absmbr` branch (not yet merged to `main`)

This branch absorbed `feature/react-project-form` (merged in) and is unmerged and not part of the verified `main` checkpoint above, but it contains real, pushed, lint-and-build-verified commits a future assistant must inspect before assuming `main` reflects everything in progress. **Working tree on this branch is clean as of the last commit below — nothing uncommitted is at risk.**

- `ddb58a2` … `1e99eaa` — controlled fields, checkboxes, display order input, and the initial type-correct payload build (`console.log`-only submit). See prior checkpoint notes below this section for the original per-commit breakdown.
- `fa5ca64` — `handleProjectSubmit` now actually calls `api.post('/api/projects', payload)` inside try/catch/finally: added `isSubmittingProject`, `projectMessage`, `projectErrors` state; resets the form with `setProjectForm(initialProjectForm)` and shows "Project created successfully." on success; on a `422` stores `error.response.data.errors` in `projectErrors` and shows "Please fix the errors below."; any other error shows "Failed to create project."; submit button disables and shows "Creating..." while in flight
- `0a23a3d` — fixed a real accessibility bug (GitHub URL and Live URL `<label htmlFor>` values didn't match their input `id`s — `github-url` vs `github_url`, `live-url` vs `live_url`), added Prettier as a dev dependency with a `format` script (mirrors Pint's role on the backend) and a `.prettierrc.json` (`singleQuote`, no semicolons), and reformatted `App.jsx` (indentation, blank lines, trailing whitespace) with it

All manually verified in the browser on this checkpoint:

- valid submission → project created, "Project created successfully." shown, form fields and both checkboxes reset to empty/unchecked
- invalid submission (empty title) → `422` response confirmed in the Network tab and browser console, "Please fix the errors below." shown, form correctly stays populated (only a successful submit clears it)
- DevTools accessibility warning ("Incorrect use of `<label for=FORM_ELEMENT>`, 2 resources") is resolved by the `0a23a3d` label/id fix

- `2c67a2d` — renders `projectErrors[field][0]` beneath every validated input (`title`, `short_description`, `description`, `tech_stack`, `github_url`, `live_url`, `is_featured`, `is_published`, `display_order`). Manually verified: submitting with an empty title now shows "The title field is required." directly under that field, in addition to the existing "Please fix the errors below." banner. `npm run lint` is fully clean (0 warnings) now that `projectErrors` is actually read.

The project-creation form is now functionally complete against items 1–6 in "Next frontend work" above.

Still missing before this branch satisfies all of items 1–8:

- refetch or update the project list after creation (not started) — right now a successful create gives no visible confirmation beyond the success message; there is nowhere in the UI yet to see the projects that exist
- separate components as the interface grows (not started) — `App.jsx` holds both auth and the entire project form in one file

### Exact next action to resume

1. Read `AGENTS.md` and this file's Section 10 resume procedure.
2. Choose a direction (ask the project owner if unclear):
   - **Frontend-first:** fetch `GET /api/projects` after login (or after a successful create) and render the list, so the create form has a visible result.
   - **Backend-first:** implement `show`, `update`, `destroy` on `ProjectController` with feature tests, rounding out CRUD before more frontend work.
3. Consider merging this branch to `main` once whichever direction is chosen reaches its own verified checkpoint — the create flow itself is already complete and stable.

Corresponding confirmed learning (the `[name]` computed-key pattern, the checkbox `.checked` vs `.value` distinction, why a number input's `.value` is still a string, and the label/id accessibility contract) is recorded in `docs/LEARNING_LOG.md`.

## 8. Verification evidence

### Manual browser and HTTP checks

Verified:

- wrong login credentials are rejected
- correct login displays the administrator
- `/api/user` returns `401` without an authenticated session
- authenticated session is recognized
- refresh restores the user
- logout works
- refresh after logout remains logged out
- credentialed CORS returns the exact React origin and allows credentials
- unauthenticated project creation returns `401`

### Backend tests

Latest complete result at commit `a26b3e5`:

```text
Tests: 10 passed (34 assertions)
Duration: 1.11s
```

Authentication tests:

- guest cannot access current-user endpoint
- user can login and access it
- incorrect credentials are rejected
- authenticated user can logout

Project API tests:

- guest cannot create a project
- authenticated session can create a project
- duplicate title receives a unique slug
- invalid data is rejected

The project tests use `$this->actingAs($user)` because the real application uses session authentication. The earlier `Sanctum::actingAs` attempt failed with missing `withAccessToken()` because it simulated token authentication.

`backend/phpunit.xml` uses:

```text
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

Tests do not modify Supabase.

### Frontend

Latest results:

```text
npm run lint
Found 0 warnings and 0 errors.

npm run build
Vite production build completed successfully.
```

### Git checks

- `git diff --check` produced only Windows LF/CRLF warnings, no whitespace errors
- exact intended files were staged
- real `.env` was not staged
- commit `a26b3e5` pushed successfully
- local `main` confirmed clean and synchronized with `origin/main`

## 9. Current status

| Area | Status |
|---|---|
| Laravel and React setup | Complete |
| Supabase PostgreSQL | Complete |
| Project model and migration | Complete |
| Public project listing | Complete |
| Project store validation | Complete |
| Unique slug creation | Complete |
| Protected project POST | Complete |
| Admin seeder | Complete |
| SPA login | Complete |
| Session restoration | Complete |
| Logout | Complete |
| Credentialed CORS | Complete |
| Authentication tests | Complete |
| Project creation tests | Complete |
| React project creation form | Complete (create only; list/edit/delete not started) |
| Public portfolio design | Not started |
| Project show endpoint | Not started |
| Project update endpoint | Not started |
| Project delete endpoint | Not started |
| Image handling | Not started |
| Deployment | Planned |

## 10. Exact resume procedure

1. Read `AGENTS.md` and all linked documentation.
2. From the project root:

```cmd
git status --short --untracked-files=all
git log --oneline --decorate -10
git fetch origin
git status -sb
```

3. If the tree is clean and documentation changes have been merged remotely, synchronize with:

```cmd
git pull --ff-only origin main
```

4. Re-run verification if the environment or code has changed:

```cmd
cd backend
herd php artisan test
cd ..\frontend
npm run lint
npm run build
```

5. Begin the React project-creation form by first inspecting:
   - `frontend/src/App.jsx`
   - `frontend/src/api.js`
   - `backend/app/Http/Requests/StoreProjectRequest.php`
   - `backend/routes/api.php`

6. Teach controlled form state and backend validation-error mapping before implementing the complete form.

## 11. Roadmap

### Authenticated Projects CRUD

- [x] Public list
- [x] Validated create
- [x] Protected create route
- [x] Backend create tests
- [ ] React create interface
- [ ] Single-project read
- [ ] Validated update
- [ ] Delete
- [ ] CRUD test coverage
- [ ] Image upload

### Public portfolio

- [ ] Hero
- [ ] About
- [ ] Skills
- [ ] Featured projects
- [ ] All published projects
- [ ] Contact
- [ ] Resume link
- [ ] Responsive and accessible styling

### Quality and deployment

- [ ] Component-level frontend structure
- [ ] Loading, empty, success, and error states
- [ ] CI checks
- [ ] Production environment plan
- [ ] Hosting deployment
- [ ] Supabase production verification
- [ ] Final README and portfolio documentation
- [ ] Resume project entry and screenshots

## 12. Related documentation

- `AGENTS.md`: permanent AI teaching and safety contract
- `docs/LEARNING_LOG.md`: confirmed learning and concepts to reinforce
- `docs/DECISIONS.md`: architectural decisions and tradeoffs
- `docs/HANDOFF_CHECKLIST.md`: safe resume, pause, commit, and assistant-change procedure

Update this memory only from verified evidence. Never include secrets.
