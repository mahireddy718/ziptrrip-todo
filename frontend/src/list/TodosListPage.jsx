import { useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import AddTodoForm from "./components/AddTodoForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import TodoItem from "./components/TodoItem.jsx";

const DEFAULT_FILTERS = {
  status: "all", // all | active | completed
  priority: "",
  search: "",
  sortBy: "createdAt",
};

export default function TodosListPage() {
  const [todos, setTodos] = useState([]);
  const [allCount, setAllCount] = useState({ active: 0, completed: 0 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: currentFilters.search,
        priority: currentFilters.priority,
        sortBy: currentFilters.sortBy,
      };
      if (currentFilters.status === "active") params.completed = false;
      if (currentFilters.status === "completed") params.completed = true;

      const result = await api.listTodos(params);
      setTodos(result.data);

      // Fetch unfiltered counts for the status tabs (active/completed totals)
      const all = await api.listTodos({});
      setAllCount({
        active: all.data.filter((t) => !t.completed).length,
        completed: all.data.filter((t) => t.completed).length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce: re-fetch ~300ms after filters settle, so typing in search
  // doesn't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => fetchTodos(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, fetchTodos]);

  async function handleCreate(payload) {
    await api.createTodo(payload);
    await fetchTodos(filters);
  }

  async function handleToggle(todo) {
    try {
      const updated = await api.updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      setAllCount((prev) => ({
        active: prev.active + (updated.completed ? -1 : 1),
        completed: prev.completed + (updated.completed ? 1 : -1),
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTodo(id);
      await fetchTodos(filters);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Todo App</p>
          <h1>Your tasks</h1>
        </div>
        <p className="muted">
          {allCount.active} active &middot; {allCount.completed} completed
        </p>
      </header>

      <AddTodoForm onCreate={handleCreate} />

      <FilterBar filters={filters} onChange={setFilters} counts={allCount} />

      {error && <p className="error-banner">{error}</p>}

      {loading ? (
        <p className="skeleton">Loading todos…</p>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <p>
            {filters.search || filters.priority || filters.status !== "all"
              ? "No todos match your filters."
              : "You're all caught up. Add your first todo above."}
          </p>
        </div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
