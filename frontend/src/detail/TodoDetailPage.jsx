import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { formatDateTime } from "../utils/format.js";

function getTodoIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

export default function TodoDetailPage() {
  const [todoId] = useState(getTodoIdFromQuery);
  const [todo, setTodo] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!todoId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getTodo(todoId)
      .then((data) => {
        if (cancelled) return;
        setTodo(data);
        setDraft(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [todoId]);

  function updateDraft(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateTodo(todoId, {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
      });
      setTodo(updated);
      setDraft(updated);
      setDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleComplete() {
    setError(null);
    try {
      const updated = await api.updateTodo(todoId, { completed: !todo.completed });
      setTodo(updated);
      setDraft(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${todo.title}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      await api.deleteTodo(todoId);
      // Full page navigation back to the list - this app is multi-page,
      // there is no client router to redirect through.
      window.location.href = "/index.html";
    } catch (err) {
      setError(err.message);
    }
  }

  if (!todoId) {
    return (
      <div className="page">
        <p className="error-banner">
          No todo id was provided in the URL. Expected a link like{" "}
          <code>todo.html?id=&lt;todo-id&gt;</code>.
        </p>
        <a href="/index.html">&larr; Back to all todos</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <p className="skeleton">Loading todo…</p>
      </div>
    );
  }

  if (error && !todo) {
    return (
      <div className="page">
        <p className="error-banner">{error}</p>
        <a href="/index.html">&larr; Back to all todos</a>
      </div>
    );
  }

  return (
    <div className="page">
      <a className="back-link" href="/index.html">
        &larr; Back to all todos
      </a>

      <header className="page-header detail-header">
        <div>
          <p className="eyebrow">Todo details</p>
          <h1 className={todo.completed ? "completed-title" : ""}>{todo.title}</h1>
        </div>
        <button
          type="button"
          className={todo.completed ? "" : "primary"}
          onClick={handleToggleComplete}
        >
          {todo.completed ? "Mark as not done" : "Mark as done"}
        </button>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <div className="card detail-card">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={draft.title}
            onChange={(e) => updateDraft("title", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Add more details about this todo…"
            value={draft.description}
            onChange={(e) => updateDraft("description", e.target.value)}
          />
        </div>

        <div className="detail-meta-row">
          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={draft.priority}
              onChange={(e) => updateDraft("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dueDate">Due date</label>
            <input
              id="dueDate"
              type="date"
              value={draft.dueDate || ""}
              onChange={(e) => updateDraft("dueDate", e.target.value)}
            />
          </div>
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" className="danger" onClick={handleDelete}>
            Delete todo
          </button>
        </div>
      </div>

      <dl className="detail-timestamps">
        <div>
          <dt>Status</dt>
          <dd>{todo.completed ? "Completed" : "Active"}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(todo.createdAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(todo.updatedAt)}</dd>
        </div>
        <div>
          <dt>Todo ID</dt>
          <dd className="todo-id">{todo.id}</dd>
        </div>
      </dl>
    </div>
  );
}
