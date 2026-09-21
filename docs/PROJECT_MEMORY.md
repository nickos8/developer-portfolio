# Developer Portfolio Project Memory

> Permanent technical handoff and resume point.
>
> Future assistant: read `AGENTS.md` and every document it references before changing the project. Inspect the working tree and tests because GitHub cannot contain uncommitted local work. Never document secrets.

**Last updated:** 2026-09-21  
**Repository:** `nickos8/developer-portfolio`  
**Default branch:** `main`  
**Latest verified code commit:** pending — see "Current phase" below (branch `claude/tender-pascal-wf0hzb`)  
**Current phase:** Full Projects CRUD complete on both backend and frontend; public portfolio page and authenticated admin dashboard implemented and styled to match the `nickos8/portfolio` design system  
**Next exact feature:** Image upload for `image_path`, then deployment planning (see section 11)  
**Working tree at checkpoint:** All listed changes below verified and ready to commit

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

### Complete project controller actions

```text
GET    /api/projects            public, published only
GET    /api/projects/{project}  public if published; auth:sanctum required if unpublished
GET    /api/admin/projects      auth:sanctum, every project regardless of publish state
POST   /api/projects            auth:sanctum, validated create with unique slug
PUT    /api/projects/{project}  auth:sanctum, validated partial update; slug regenerates only when the title changes
DELETE /api/projects/{project}  auth:sanctum, deletes the project
```

`show`, `update`, and `destroy` use Laravel implicit route-model binding (`Project $project`), so an unknown id already 404s before the controller runs.

`UpdateProjectRequest` mirrors `StoreProjectRequest` but every field is `sometimes`, so a `PUT` may send only the fields that changed. The controller only regenerates the slug when the incoming `title` differs from the stored one, so editing unrelated fields never changes a project's URL.

- image upload: not implemented — `image_path` remains a plain string column

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

### Public portfolio and admin dashboard

`App.jsx` now renders one of two views from a single piece of state (`view`, `'public' | 'admin'`), toggled by the header button and the footer's "Admin" link — no router library was added, since the whole thing is one SPA and both views live behind the same root.

Components (`frontend/src/components/`):

- `Header.jsx` — sticky nav bar, view toggle, theme toggle (persists to `localStorage`, falls back to `dark`)
- `Hero.jsx`, `ProjectsSection.jsx`, `ProjectCard.jsx`, `Footer.jsx` — the public page; `ProjectsSection` fetches `GET /api/projects` and renders only published projects
- `admin/LoginForm.jsx` — unchanged login sequence (CSRF cookie → `/login` → `/api/user`), now returned by `App.jsx` when no session exists
- `admin/AdminDashboard.jsx` — fetches `GET /api/admin/projects` (every project, published or not) and renders a list with **Edit**/**Delete** per row
- `admin/ProjectForm.jsx` — one form for both create and edit. `AdminDashboard` gives it `key={editingProject?.id ?? 'new'}` so switching between "new" and "edit an existing project" remounts it with fresh state instead of syncing props to state inside an effect (React's own guidance, and it also sidesteps an `oxlint` `set-state-in-effect` warning)
- Technology list is a single comma-separated text input, split into an array client-side before `POST`/`PUT`
- Laravel's `422` response body (`error.response.data.errors`) is mapped directly onto each field's `field-error` message; any other failure shows a general `form-message`

Visual design: `frontend/src/index.css` and `App.css` port the `nickos8/portfolio` repo's color tokens (dark theme by default, `data-theme="light"` override), the `Inter` + `JetBrains Mono` font pairing, and its card/pill/tag/button component classes, so the two repos read as one visual system. The portfolio repo's static marketing content (hero copy, timeline, skills, certificates) was not copied — this app's hero and content are about the CRUD demo itself, since the "projects" here are the live, editable data.

### Known limitation on this environment

This session had no network path to the Supabase Postgres instance, so the full stack could not be exercised end-to-end in a browser (`herd php artisan serve` + `npm run dev` against real data). Verification instead relied on: the full backend feature-test suite (SQLite `:memory:`, 21 tests, listed below) covering every route and permission boundary, and `npm run lint` / `npm run build` for the frontend. Do a manual browser pass — login, create, edit, publish/unpublish, delete, theme toggle — the first time this runs against the real database.

### Next frontend work

1. Image upload for `image_path` (multipart form, Laravel `Storage`, an `<input type="file">` in `ProjectForm`)
2. Drag-to-reorder or numeric-only reordering UX for `display_order`
3. Manual browser verification against Supabase (see limitation above)
4. Deployment (see roadmap)

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

Latest complete result on this checkpoint:

```text
Tests: 21 passed (58 assertions)
Duration: 0.71s
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
- guest can view a single published project
- guest cannot view an unpublished project
- authenticated user can view an unpublished project
- guest cannot see the admin project list
- authenticated user sees every project in the admin list
- guest cannot update a project
- authenticated user can update a project
- updating a project without changing the title keeps the slug
- invalid update data is rejected
- guest cannot delete a project
- authenticated user can delete a project

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
| React project creation form | Complete |
| React edit/delete dashboard | Complete |
| Public portfolio design (matching `portfolio` repo) | Complete |
| Project show endpoint | Complete |
| Project update endpoint | Complete |
| Project delete endpoint | Complete |
| Manual browser verification against Supabase | Not done in this session (no network path) |
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
- [x] React create interface
- [x] Single-project read
- [x] Validated update
- [x] Delete
- [x] CRUD test coverage
- [ ] Image upload

### Public portfolio

- [x] Hero (CRUD-demo framing, styled like `portfolio` repo)
- [ ] About
- [ ] Skills
- [x] Featured projects (tagged inline on published project cards)
- [x] All published projects
- [ ] Contact
- [ ] Resume link
- [x] Responsive card grid (single column under 820px)
- [ ] Full accessibility pass (focus order, aria labels on icon-only buttons)

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
