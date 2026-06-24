// Centralized API client. Both pages (list + detail) import from here.
// In dev, Vite proxies /api -> http://localhost:4000 (see vite.config.js).
// In production, set VITE_API_BASE_URL to the deployed backend's URL, or
// leave it unset if frontend and backend are served from the same origin.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://ziptrrip-todo.onrender.com/api"
    : "/api");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.details = body.details;
    error.status = res.status;
    throw error;
  }

  return body.data !== undefined ? body : body;
}

export const api = {
  /** @param {{completed?: boolean, priority?: string, search?: string, sortBy?: string, order?: string}} params */
  async listTodos(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    const result = await request(`/todos${qs ? `?${qs}` : ""}`);
    return result; // { data: [...], count }
  },

  async getTodo(id) {
    const result = await request(`/todos/${id}`);
    return result.data;
  },

  async createTodo(payload) {
    const result = await request(`/todos`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return result.data;
  },

  async updateTodo(id, payload) {
    const result = await request(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return result.data;
  },

  async deleteTodo(id) {
    await request(`/todos/${id}`, { method: "DELETE" });
  },
};
