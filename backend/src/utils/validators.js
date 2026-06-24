const VALID_PRIORITIES = ["low", "medium", "high"];

/**
 * Validates the body for creating a new todo.
 * Returns an array of error strings (empty array = valid).
 */
export function validateCreate(body) {
  const errors = [];

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string");
  } else if (body.title.length > 200) {
    errors.push("title must be 200 characters or fewer");
  }

  if (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) {
    errors.push("description must be a string");
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    if (typeof body.dueDate !== "string" || isNaN(Date.parse(body.dueDate))) {
      errors.push("dueDate must be a valid date string (e.g. 2026-07-01) or null");
    }
  }

  if (body.subtasks !== undefined) {
    if (!Array.isArray(body.subtasks)) {
      errors.push("subtasks must be an array");
    } else {
      body.subtasks.forEach((st, idx) => {
        if (typeof st.title !== "string" || st.title.trim().length === 0) {
          errors.push(`subtask at index ${idx} must have a non-empty title string`);
        }
        if (st.completed !== undefined && typeof st.completed !== "boolean") {
          errors.push(`subtask at index ${idx} completed status must be a boolean`);
        }
      });
    }
  }

  return errors;
}

/**
 * Validates the body for updating an existing todo.
 * All fields are optional, but if present must be the right type/shape.
 */
export function validateUpdate(body) {
  const errors = [];

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push("title must be a non-empty string");
    } else if (body.title.length > 200) {
      errors.push("title must be 200 characters or fewer");
    }
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    errors.push("completed must be a boolean");
  }

  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    if (typeof body.dueDate !== "string" || isNaN(Date.parse(body.dueDate))) {
      errors.push("dueDate must be a valid date string (e.g. 2026-07-01) or null");
    }
  }

  if (body.subtasks !== undefined) {
    if (!Array.isArray(body.subtasks)) {
      errors.push("subtasks must be an array");
    } else {
      body.subtasks.forEach((st, idx) => {
        if (typeof st.title !== "string" || st.title.trim().length === 0) {
          errors.push(`subtask at index ${idx} must have a non-empty title string`);
        }
        if (st.completed !== undefined && typeof st.completed !== "boolean") {
          errors.push(`subtask at index ${idx} completed status must be a boolean`);
        }
      });
    }
  }

  return errors;
}

export { VALID_PRIORITIES };
