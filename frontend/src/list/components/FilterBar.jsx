const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function FilterBar({ filters, onChange, counts }) {
  return (
    <div className="card filter-bar">
      <div className="status-tabs" role="tablist" aria-label="Filter by status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={filters.status === opt.value}
            className={`status-tab ${filters.status === opt.value ? "active" : ""}`}
            onClick={() => onChange({ ...filters, status: opt.value })}
          >
            {opt.label}
            {opt.value === "active" && counts ? ` (${counts.active})` : ""}
            {opt.value === "completed" && counts ? ` (${counts.completed})` : ""}
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search todos…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search todos"
        />

        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          aria-label="Sort by"
        >
          <option value="createdAt">Sort: newest first</option>
          <option value="dueDate">Sort: due date</option>
          <option value="priority">Sort: priority</option>
        </select>
      </div>
    </div>
  );
}
