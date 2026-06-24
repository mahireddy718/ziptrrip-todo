# API Reference

Base URL (local dev): `http://localhost:4000/api`

All request/response bodies are JSON. All responses use
`Content-Type: application/json` except `204 No Content` on delete.

## Data model

```ts
{
  id: string;           // UUID, assigned by the server, immutable
  title: string;        // required, 1-200 characters
  description: string;  // optional, defaults to ""
  completed: boolean;   // defaults to false
  priority: "low" | "medium" | "high"; // defaults to "medium"
  dueDate: string | null; // "YYYY-MM-DD" (or any Date-parseable string), or null
  createdAt: string;    // ISO 8601, set once on creation, immutable
  updatedAt: string;    // ISO 8601, refreshed on every update
}
```

## Endpoints

### `GET /api/health`

Liveness check.

**Response `200`**
```json
{ "status": "ok" }
```

---

### `GET /api/todos`

List todos. All query parameters are optional and can be combined.

| Param | Values | Effect |
|---|---|---|
| `completed` | `true` \| `false` | Filter by completion status |
| `priority` | `low` \| `medium` \| `high` | Filter by priority |
| `search` | any string | Case-insensitive substring match against `title` or `description` |
| `sortBy` | `createdAt` (default) \| `dueDate` \| `priority` | Field to sort by |
| `order` | `asc` \| `desc` | Sort direction. Defaults to `desc` for `createdAt`, `asc` otherwise |

**Example**
```
GET /api/todos?completed=false&priority=high&sortBy=dueDate&order=asc
```

**Response `200`**
```json
{
  "data": [
    {
      "id": "a1f3c2d4-2222-4a2b-9c3d-0002example2",
      "title": "Design the todos list page",
      "description": "Add filters, search, and sorting controls.",
      "completed": false,
      "priority": "high",
      "dueDate": "2026-06-28",
      "createdAt": "2026-06-21T10:15:00.000Z",
      "updatedAt": "2026-06-21T10:15:00.000Z"
    }
  ],
  "count": 1
}
```

---

### `GET /api/todos/:id`

Fetch a single todo.

**Response `200`**
```json
{ "data": { "id": "...", "title": "...", "...": "..." } }
```

**Response `404`** (unknown id)
```json
{ "error": "Todo with id \"xyz\" was not found" }
```

---

### `POST /api/todos`

Create a new todo.

**Request body**
```json
{
  "title": "Renew passport",
  "description": "Expires next month",
  "priority": "high",
  "dueDate": "2026-07-15"
}
```
Only `title` is required; `description`, `priority`, and `dueDate` are
optional and default as described in the data model above. `completed`
cannot be set on create — new todos always start as `false`.

**Response `201`**
```json
{ "data": { "id": "<new-uuid>", "title": "Renew passport", "completed": false, "...": "..." } }
```

**Response `400`** (validation failure)
```json
{
  "error": "Validation failed",
  "details": ["title is required and must be a non-empty string"]
}
```

---

### `PUT /api/todos/:id` and `PATCH /api/todos/:id`

Update an existing todo. Both verbs are handled identically by the same
partial-update logic — send only the fields you want to change (`id`,
`createdAt` are immutable and ignored if present in the body; `updatedAt`
is always recalculated server-side).

| Use case | Example body |
|---|---|
| Toggle completion | `{ "completed": true }` |
| Rename | `{ "title": "New title" }` |
| Full edit | `{ "title": "...", "description": "...", "priority": "low", "dueDate": null }` |

**Response `200`**
```json
{ "data": { "id": "...", "title": "...", "updatedAt": "<new timestamp>", "...": "..." } }
```

**Response `400`** — same shape as the create validation error.
**Response `404`** — same shape as the get-by-id 404.

---

### `DELETE /api/todos/:id`

Delete a todo permanently.

**Response `204`** — empty body.
**Response `404`** — unknown id, same error shape as above.

---

## Error format

Every error response (validation, not-found, unhandled server error) has
the same basic shape:

```json
{ "error": "Human-readable message", "details": ["optional", "array", "for validation"] }
```

| Status | Meaning |
|---|---|
| `400` | Request body failed validation (see `details` for specifics) |
| `404` | No todo exists with the given id |
| `500` | Unexpected server error (logged server-side) |
