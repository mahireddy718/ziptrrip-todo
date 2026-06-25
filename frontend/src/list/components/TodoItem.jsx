import { formatHumanizedDueDate, isOverdue } from "../../utils/format.js";

export default function TodoItem({ todo, onToggle, onDelete }) {
  const overdue = isOverdue(todo.dueDate, todo.completed);

  function handleDelete() {
    onDelete(todo);
  }

  // Capitalize priority label for a cleaner look
  const capitalizedPriority = todo.priority
    ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)
    : "";

  const subtasksCount = todo.subtasks?.length || 0;
  const completedSubtasksCount = todo.subtasks?.filter((st) => st.completed).length || 0;
  const percentComplete = subtasksCount > 0 ? Math.round((completedSubtasksCount / subtasksCount) * 100) : 0;

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={todo.completed ? "Mark task as incomplete" : "Mark task as complete"}
        className="todo-checkbox"
      />

      <div className="todo-main">
        {/* Navigate directly to the task details page */}
        <a className="todo-title" href={`/todo.html?id=${todo.id}`}>
          {todo.title}
        </a>
        <div className="todo-meta">
          <span className={`badge priority-${todo.priority}`}>{capitalizedPriority}</span>
          {todo.dueDate && (
            <span className={`due-date ${overdue ? "overdue" : ""}`}>
              {overdue ? "Overdue: " : "Due "}
              {formatHumanizedDueDate(todo.dueDate)}
            </span>
          )}
        </div>
        
        {subtasksCount > 0 && (
          <div className="subtask-progress-container" style={{ marginTop: "10px", width: "100%", maxWidth: "260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
              <span style={{ fontWeight: 500 }}>Checklist</span>
              <span>{completedSubtasksCount} of {subtasksCount} complete</span>
            </div>
            <div className="progress-bar-bg" style={{ height: "4px", background: "var(--color-border)", borderRadius: "2px", overflow: "hidden" }}>
              <div className="progress-bar-fill" style={{ height: "100%", width: `${percentComplete}%`, background: "var(--color-accent)", transition: "width 0.3s ease" }}></div>
            </div>
          </div>
        )}
      </div>

      <button type="button" className="danger todo-delete" onClick={handleDelete}>
        Delete
      </button>
    </li>
  );
}
