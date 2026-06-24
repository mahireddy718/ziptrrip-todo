import { formatDate, isOverdue } from "../../utils/format.js";

export default function TodoItem({ todo, onToggle, onDelete }) {
  const overdue = isOverdue(todo.dueDate, todo.completed);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${todo.title}"? This can't be undone.`);
    if (confirmed) {
      await onDelete(todo.id);
    }
  }

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        className="todo-checkbox"
      />

      <div className="todo-main">
        {/* Real navigation (full page load) to the detail page - NOT client-side routing */}
        <a className="todo-title" href={`/todo.html?id=${todo.id}`}>
          {todo.title}
        </a>
        <div className="todo-meta">
          <span className={`badge priority-${todo.priority}`}>{todo.priority}</span>
          {todo.dueDate && (
            <span className={`due-date ${overdue ? "overdue" : ""}`}>
              {overdue ? "Overdue: " : "Due "}
              {formatDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      <button type="button" className="danger todo-delete" onClick={handleDelete}>
        Delete
      </button>
    </li>
  );
}
