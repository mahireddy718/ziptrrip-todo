# Todo App

A full-stack todo application built as a multi-page React frontend backed by
a Node.js/Express REST API, with data persisted to a JSON file on disk.

```
todo-app/
├── backend/   Express REST API (CRUD for todos), JSON-file storage
├── frontend/  Multi-page React app (Vite), one real page per route
└── docs/
    ├── FEATURES.md   Full feature list for both pages and the API
    └── API.md        REST API reference (endpoints, params, examples)
```

## Why "multi-page" and not a single-page app

The brief asked for multiple pages instead of an SPA. Concretely, this means:

- There are **two separate HTML entry points** — `frontend/index.html` (todos
  list) and `frontend/todo.html` (single todo detail) — each one boots its
  **own independent React tree** via its own `main.jsx`.
- Navigation between them is done with plain `<a href="/todo.html?id=...">`
  links, which trigger a real **full page load** in the browser. There is no
  `react-router` or other client-side router gluing the two pages together
  into one process.
- `vite.config.js` is configured with two `rollupOptions.input` entries so
  `vite build` emits two independent, fully-formed HTML pages in `dist/`.

The detail page reads which todo to display from the URL's query string
(`?id=<uuid>`) using `URLSearchParams` — exactly like a server-rendered app
would — rather than via in-memory route state.

## Quick start

You need two terminals (or two background processes): one for the API,
one for the frontend.

### 1. Backend (API)

```bash
cd backend
npm install
npm start          # listens on http://localhost:4000
```

Data is stored in `backend/src/data/todos.json` and is seeded with a few
example todos on first run. To start from a clean slate, just empty that
file to `[]`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

In dev mode, Vite proxies any request to `/api/*` straight through to the
Express server on port 4000 (see `frontend/vite.config.js`), so the two apps
talk to each other with no extra configuration. Open
**http://localhost:5173** to see the todos list.

### Production build

```bash
cd frontend
npm run build       # outputs dist/index.html and dist/todo.html
npm run preview      # serve the production build locally
```

When deploying for real, either:
- serve `frontend/dist` and the Express API from the same origin/domain
  (e.g. behind a reverse proxy that routes `/api/*` to the Express process
  and everything else to the static files), or
- set `VITE_API_BASE_URL` at build time to the full URL of the deployed
  backend (e.g. `https://api.example.com/api`) if frontend and backend are
  hosted on different origins. See `frontend/src/api/client.js`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite (multi-page build) | Fast dev server, simple multi-entry config, no router needed since pages are real navigations |
| Backend | Node.js + Express | Matches the brief exactly; minimal boilerplate for a small CRUD API |
| Storage | JSON file (`backend/src/data/todos.json`) | Brief allows "a file or a database, either is fine"; a file keeps the project dependency-free and easy to inspect/reset |

## Documentation

- **[docs/FEATURES.md](docs/FEATURES.md)** — everything the list page,
  detail page, and API can do.
- **[docs/API.md](docs/API.md)** — full REST endpoint reference with
  example requests/responses.

## Data model

```json
{
  "id": "uuid",
  "title": "string, required",
  "description": "string, optional",
  "completed": "boolean",
  "priority": "low | medium | high",
  "dueDate": "YYYY-MM-DD or null",
  "createdAt": "ISO 8601 timestamp, set on creation",
  "updatedAt": "ISO 8601 timestamp, updated on every change"
}
```

## Manual testing performed

Every backend endpoint (list with filters/search/sort, get-by-id, create,
update via PUT and PATCH, delete, and the validation-error paths) was
exercised with `curl` during development. The frontend was built with
`vite build` to confirm both pages compile as independent entry points, and
both `vite dev` (with the `/api` proxy) and `vite preview` were run
end-to-end against a live backend to confirm the pages load and the proxy
correctly forwards API requests.
