import { randomUUID } from "crypto";
import { store } from "../data/store.js";
import { validateCreate, validateUpdate } from "../utils/validators.js";

/**
 * GET /api/todos
 * Supports optional query params:
 *   completed=true|false   - filter by completion status
 *   priority=low|medium|high - filter by priority
 *   search=<text>           - case-insensitive match on title or description
 *   sortBy=createdAt|dueDate|priority (default createdAt)
 *   order=asc|desc           (default desc for createdAt, asc otherwise)
 */
export async function listTodos(req, res, next) {
  try {
    const { completed, priority, search, sortBy = "createdAt", order } = req.query;

    const filters = {};
    if (completed !== undefined) {
      filters.completed = completed === "true";
    }
    if (priority) {
      filters.priority = priority;
    }
    if (search) {
      filters.search = search;
    }

    const todos = await store.getAll(filters, { sortBy, order });
    res.json({ data: todos, count: todos.length });
  } catch (err) {
    next(err);
  }
}

/** GET /api/todos/:id */
export async function getTodo(req, res, next) {
  try {
    const todo = await store.getById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: `Todo with id "${req.params.id}" was not found` });
    }
    res.json({ data: todo });
  } catch (err) {
    next(err);
  }
}

/** POST /api/todos */
export async function createTodo(req, res, next) {
  try {
    const errors = validateCreate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const now = new Date().toISOString();
    const todo = {
      id: randomUUID(),
      title: req.body.title.trim(),
      description: req.body.description?.trim() || "",
      completed: false,
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || null,
      subtasks: req.body.subtasks || [],
      createdAt: now,
      updatedAt: now,
    };

    await store.create(todo);
    res.status(201).json({ data: todo });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/todos/:id  and  PATCH /api/todos/:id (partial update) */
export async function updateTodo(req, res, next) {
  try {
    const errors = validateUpdate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const updates = { ...req.body };
    if (typeof updates.title === "string") updates.title = updates.title.trim();
    if (typeof updates.description === "string") updates.description = updates.description.trim();

    const updated = await store.update(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: `Todo with id "${req.params.id}" was not found` });
    }
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/todos/:id */
export async function deleteTodo(req, res, next) {
  try {
    const removed = await store.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: `Todo with id "${req.params.id}" was not found` });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/todos/stream
 * Server-Sent Events stream that emits MongoDB change events when
 * `MONGO_URI` is configured. Each message is a JSON payload with
 * { operationType, fullDocument, documentKey }.
 */
export async function streamTodos(req, res, next) {
  try {
    if (typeof store.watchChanges !== "function") {
      return res.status(501).json({ error: "Realtime stream not supported" });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const closer = await store.watchChanges(
      (change) => {
        const payload = {
          operationType: change.operationType,
          fullDocument: change.fullDocument || null,
          documentKey: change.documentKey || null,
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      },
      (err) => {
        res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
      }
    );

    req.on("close", () => {
      try {
        closer();
      } catch (e) {
        // ignore
      }
    });
  } catch (err) {
    next(err);
  }
}
