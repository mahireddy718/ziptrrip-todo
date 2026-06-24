import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

export default function AddTodoForm({ onCreate }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give your todo a title before adding it.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      setForm(initialState);
      setExpanded(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card add-todo-form" onSubmit={handleSubmit}>
      <div className="add-todo-row">
        <input
          type="text"
          placeholder="Add a new todo&hellip; e.g. Renew passport"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          onFocus={() => setExpanded(true)}
          aria-label="Todo title"
        />
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>

      {expanded && (
        <div className="add-todo-details">
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={2}
              placeholder="Optional details…"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="add-todo-meta-row">
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
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
                value={form.dueDate}
                onChange={(e) => updateField("dueDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </form>
  );
}
