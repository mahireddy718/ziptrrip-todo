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
    let todos = await store.getAll();
    const { completed, priority, search, sortBy = "createdAt", order } = req.query;

    if (completed !== undefined) {
      const wantCompleted = completed === "true";
      todos = todos.filter((t) => t.completed === wantCompleted);
    }

    if (priority) {
      todos = todos.filter((t) => t.priority === priority);
    }

    if (search) {
      const needle = search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          (t.description || "").toLowerCase().includes(needle)
      );
    }

    const priorityRank = { high: 3, medium: 2, low: 1 };
    const sorters = {
      createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      dueDate: (a, b) => {
        // todos without a due date sort to the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      },
      priority: (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
    };

    const sorter = sorters[sortBy] || sorters.createdAt;
    const defaultOrder = sortBy === "createdAt" ? "desc" : "asc";
    const effectiveOrder = order || defaultOrder;

    todos = [...todos].sort(sorter);
    if (effectiveOrder === "desc") todos.reverse();

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
