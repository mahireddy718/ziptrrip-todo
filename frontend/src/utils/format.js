/**
 * Formats a due date in a friendly, humanized way.
 * Examples: "Today", "Tomorrow", "Yesterday", "Friday", "In 3 days", "5 days ago".
 */
export function formatHumanizedDueDate(dateStr) {
  if (!dateStr) return null;
  
  // Parse YYYY-MM-DD in local time to prevent timezone shift issues
  const parts = dateStr.split("-");
  let due;
  if (parts.length === 3) {
    due = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
  } else {
    due = new Date(dateStr);
  }
  
  if (isNaN(due.getTime())) return dateStr;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays === -1) {
    return "Yesterday";
  } else if (diffDays > 1 && diffDays < 7) {
    // Return weekday name (e.g. "Friday")
    return due.toLocaleDateString(undefined, { weekday: "long" });
  } else if (diffDays > 0) {
    return `In ${diffDays} days`;
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
}

/**
 * Standard date formatting (fallback / absolute format).
 */
export function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a timestamp as a relative time description (e.g. "just now", "5 minutes ago").
 * Falls back to an absolute date-time format for dates older than 7 days.
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (Math.abs(diffSec) < 30) {
    return "just now";
  }
  
  if (diffSec > 0) {
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    if (diffHr < 24) return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
    if (diffDay < 7) return diffDay === 1 ? "yesterday" : `${diffDay} days ago`;
  } else {
    const absSec = Math.abs(diffSec);
    const absMin = Math.abs(diffMin);
    const absHr = Math.abs(diffHr);
    const absDay = Math.abs(diffDay);
    if (absSec < 60) return `in ${absSec} seconds`;
    if (absMin < 60) return absMin === 1 ? "in 1 minute" : `in ${absMin} minutes`;
    if (absHr < 24) return absHr === 1 ? "in 1 hour" : `in ${absHr} hours`;
    if (absDay < 7) return absDay === 1 ? "tomorrow" : `in ${absDay} days`;
  }

  // Fallback for older timestamps
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Absolute date and time formatting helper.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Checks if a task is overdue.
 */
export function isOverdue(dueDate, completed) {
  if (!dueDate || completed) return false;
  
  const parts = dueDate.split("-");
  let due;
  if (parts.length === 3) {
    due = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
  } else {
    due = new Date(dueDate);
  }
  if (isNaN(due.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
