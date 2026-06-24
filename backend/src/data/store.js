import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "todos.json");

/**
 * Very small JSON-file "database".
 *
 * Writes are serialized through a single in-memory queue (writeLock) so
 * that two near-simultaneous requests can't interleave and corrupt the
 * file. This is sufficient for a single-process demo app; a real
 * production app would use a proper database with transactions instead.
 */
let writeLock = Promise.resolve();

async function readAll() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      // No file yet -> start with an empty list.
      return [];
    }
    throw err;
  }
}

async function writeAll(todos) {
  // Chain onto the existing lock so writes happen one at a time, in order.
  writeLock = writeLock.then(() =>
    fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8")
  );
  return writeLock;
}

export const store = {
  async getAll() {
    return readAll();
  },

  async getById(id) {
    const todos = await readAll();
    return todos.find((t) => t.id === id) || null;
  },

  async create(todo) {
    const todos = await readAll();
    todos.push(todo);
    await writeAll(todos);
    return todo;
  },

  async update(id, updates) {
    const todos = await readAll();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...todos[index],
      ...updates,
      id: todos[index].id, // id is immutable
      createdAt: todos[index].createdAt, // createdAt is immutable
      updatedAt: new Date().toISOString(),
    };
    todos[index] = updated;
    await writeAll(todos);
    return updated;
  },

  async remove(id) {
    const todos = await readAll();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return false;

    todos.splice(index, 1);
    await writeAll(todos);
    return true;
  },
};
