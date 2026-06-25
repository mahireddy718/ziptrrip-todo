# Features & Functionality

This document is the canonical list of what the application does. Per the
assignment's qualification rules, only what's documented here counts —
so anything you change in the code should be reflected here too.

## 1. Todos List page (`index.html`)

The home page. Shows every todo and lets you manage the whole list.

| Feature | Details |
|---|---|
| **Add a todo** | A single-line input is always visible. Typing and submitting (Enter or the *Add* button) creates a todo with just a title. Focusing the input expands an optional panel for **description**, **priority** (low/medium/high, defaults to medium), and **due date**. |
| **List all todos** | Fetched from `GET /api/todos` on page load. |
| **Mark complete / incomplete** | A checkbox on each row toggles `completed` via `PATCH /api/todos/:id`. Completed todos get a strikethrough title. |
| **Delete a todo** | A *Delete* button on each row, guarded by a premium custom confirmation modal overlay (with a blurred background and keyframe scale animations) so accidental clicks cannot destroy data. |
| **Filter by status** | Tabs for **All / Active / Completed**. Active/Completed tabs show live counts. |
| **Filter by priority** | A dropdown to narrow the list to only High, Medium, or Low priority todos. |
| **Search** | A text box matches against both `title` and `description` (case-insensitive substring match), debounced by 300ms so it doesn't spam the API while typing. |
| **Sort** | Sort by **newest first** (creation date, default), **due date** (soonest first; todos with no due date sort last), or **priority** (high → low). |
| **Due-date awareness** | Todos with a due date show "Due <date>"; if the date has passed and the todo isn't completed, it's shown in red as "Overdue: <date>". |
| **Item counts** | The header shows "*N active · M completed*" across the *entire* list (independent of the current filter), so you always know your overall progress. |
| **Empty states** | A friendly message is shown either when you have no todos at all, or when your current filters/search match nothing. |
| **Loading & error states** | A loading message is shown while the initial fetch is in flight; any API error (e.g. backend down) is shown in a dismissible-style banner instead of crashing the page. |
| **Navigate to a todo's detail page** | Clicking a todo's title is a normal link (`<a href="/todo.html?id=...">`) — a real page navigation, not a client-side route change. |

## 2. Todo Detail page (`todo.html?id=<uuid>`)

A dedicated page for one todo, identified entirely through the `id` query
parameter (read with `URLSearchParams`, no router involved).

| Feature | Details |
|---|---|
| **Load by query parameter** | On mount, the page reads `?id=` from `window.location.search` and fetches that todo via `GET /api/todos/:id`. |
| **Full detail view** | Shows title, description, priority, due date, completion status, and both `createdAt`/`updatedAt` timestamps (the "any other information associated with it" called for in the brief) plus the todo's id. |
| **Edit in place** | Title, description, priority, and due date are all editable form fields. A *Save changes* button (disabled until something actually changes) persists edits via `PATCH /api/todos/:id`. |
| **Toggle complete / incomplete** | A button in the header flips completion status immediately (no need to hit Save). |
| **Delete** | A *Delete todo* button triggers the premium custom confirmation modal. If confirmed, deletes the todo and performs a full-page redirect back to the list dashboard (`window.location.href = "/index.html"`). |
| **Back link** | A "&larr; Back to all todos" link returns to the list page. |
| **Missing/invalid id handling** | If there's no `id` in the URL, or the id doesn't match any todo (404 from the API), a clear message is shown instead of a blank or broken page. |
| **Loading & error states** | Mirrors the list page's approach: a loading message while fetching, and an inline error banner if a save/delete/toggle request fails. |

## 3. Backend API (Express)

See **[API.md](API.md)** for the full endpoint reference (URLs, query
params, request/response bodies, status codes). At a glance, it exposes:

- Full CRUD for todos: **list** (with filtering/search/sorting), **get one**,
  **create**, **update** (`PUT` for full replace, `PATCH` for partial), and
  **delete**.
- Server-side **validation** on create/update (title required and ≤200
  chars, priority restricted to `low|medium|high`, `dueDate` must parse as a
  real date or be `null`), returning `400` with a list of specific error
  messages on failure.
- Consistent **error responses** (`{ "error": "..." }`, with a `details`
  array for validation failures) and proper HTTP status codes (`200`, `201`,
  `204`, `400`, `404`, `500`).
- **CORS enabled** so the Vite dev server (a different origin) can call it
  directly during development.
- A `GET /api/health` endpoint for basic liveness checking.
- Data is persisted to `backend/src/data/todos.json` between server
  restarts; writes are serialized through an internal lock so two
  near-simultaneous requests can't corrupt the file.

## 4. Advanced Features (Added for Placement Assignment)

These features were added to make the application feel like a production-ready product and demonstrate full-stack engineering skills.

| Feature | Details |
|---|---|
| **Sub-tasks (Checklists)** | Any todo can have an arbitrary number of sub-tasks. You can manage them (add steps, toggle completed steps, delete steps) in-place on the single todo detail page. Progress (completed checklist items out of total checklist items) is displayed visually on the main todos list page via a progress bar. |
| **Persistent Dark Mode** | A theme toggle button swaps between Light and Dark mode. Theme state is saved to `localStorage` and read instantly in the document's `<head>` before render, avoiding any white flash on refresh or full page navigation across pages. |
| **Custom confirmation modals** | Replaces basic browser alerts and `window.confirm` popups with beautiful, custom-styled dialog modal overlays. Operates natively with keyframe animations, blurred overlays, and proper responsive padding for desktop and mobile. |

## Out of scope / possible future additions

Documented here so it's clear these were a deliberate choice, not an
oversight:

- **Authentication / multi-user support** — the brief describes a single
  todo list, so there's no login or per-user data separation.
- **Pagination** — the list endpoint returns all todos at once; fine for a
  personal todo list's scale, but would need pagination for very large
  datasets.
- **Optimistic UI updates** — toggling/deleting waits for the API response
  before updating the UI rather than assuming success immediately; this
  trades a little perceived speed for always showing accurate state.
