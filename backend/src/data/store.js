import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "todos.json");

const MONGO_URI = process.env.MONGO_URI || null;

// File-backed helpers (fallback)
let writeLock = Promise.resolve();
async function readAllFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
async function writeAllFile(todos) {
  writeLock = writeLock.then(() =>
    fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8")
  );
  return writeLock;
}

// MongoDB connection helpers
let mongoClientPromise = null;
let mongoCollection = null;
let lastConnectFailureTime = 0;
const FAILURE_COOLDOWN_MS = 30000; // 30 seconds cooldown

async function ensureMongo() {
  if (!MONGO_URI) return null;
  if (mongoCollection) return mongoCollection;

  // If connection failed recently, skip trying to connect to avoid blocking requests
  const now = Date.now();
  if (now - lastConnectFailureTime < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!mongoClientPromise) {
    console.log("Connecting to MongoDB Atlas database server...");
    const client = new MongoClient(MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    mongoClientPromise = client
      .connect()
      .then(() => {
        const dbName = process.env.MONGO_DB || "todo-app";
        const db = client.db(dbName);
        mongoCollection = db.collection("todos");
        console.log("Successfully connected to MongoDB server!");
        return client;
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB server, falling back to local JSON file store:", err.message);
        mongoClientPromise = null;
        lastConnectFailureTime = Date.now();
        return null;
      });
  }
  await mongoClientPromise;
  return mongoCollection;
}

function docToTodo(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export const store = {
  async getAll(filters = {}, sortOptions = {}) {
    const coll = await ensureMongo();
    if (coll) {
      const mongoQuery = {};
      if (filters.completed !== undefined) {
        mongoQuery.completed = filters.completed;
      }
      if (filters.priority) {
        mongoQuery.priority = filters.priority;
      }
      if (filters.search) {
        const needle = filters.search;
        mongoQuery.$or = [
          { title: { $regex: needle, $options: "i" } },
          { description: { $regex: needle, $options: "i" } }
        ];
      }

      const { sortBy = "createdAt", order } = sortOptions;
      const defaultOrder = sortBy === "createdAt" ? -1 : 1;
      const direction = order ? (order === "desc" ? -1 : 1) : defaultOrder;

      let cursor = coll.find(mongoQuery);
      if (sortBy === "createdAt") {
        cursor = cursor.sort({ createdAt: direction });
      } else {
        cursor = cursor.sort({ [sortBy]: direction });
      }

      let docs = await cursor.toArray();
      let todos = docs.map(docToTodo);

      // Refined sorting for special cases (null due dates and priority ranks)
      if (sortBy === "priority" || sortBy === "dueDate") {
        const priorityRank = { high: 3, medium: 2, low: 1 };
        const sorters = {
          dueDate: (a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          },
          priority: (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
        };
        const sorter = sorters[sortBy];
        todos.sort(sorter);
        if (direction === -1) todos.reverse();
      }
      return todos;
    }

    // JSON file store fallback (filtered and sorted in memory)
    let todos = await readAllFile();
    if (filters.completed !== undefined) {
      todos = todos.filter((t) => t.completed === filters.completed);
    }
    if (filters.priority) {
      todos = todos.filter((t) => t.priority === filters.priority);
    }
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) ||
          (t.description || "").toLowerCase().includes(needle)
      );
    }

    const { sortBy = "createdAt", order } = sortOptions;
    const priorityRank = { high: 3, medium: 2, low: 1 };
    const sorters = {
      createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      dueDate: (a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      },
      priority: (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
    };
    const sorter = sorters[sortBy] || sorters.createdAt;
    const defaultOrder = sortBy === "createdAt" ? "desc" : "asc";
    const effectiveOrder = order || defaultOrder;

    todos = [...todos].sort(sorter);
    if (effectiveOrder === "desc") todos.reverse();
    return todos;
  },

  async getById(id) {
    const coll = await ensureMongo();
    if (coll) {
      const doc = await coll.findOne({ _id: id });
      return docToTodo(doc);
    }
    const todos = await readAllFile();
    return todos.find((t) => t.id === id) || null;
  },

  async create(todo) {
    const coll = await ensureMongo();
    if (coll) {
      const doc = { _id: todo.id, ...todo };
      await coll.insertOne(doc);
      return todo;
    }
    const todos = await readAllFile();
    todos.push(todo);
    await writeAllFile(todos);
    return todo;
  },

  async update(id, updates) {
    const coll = await ensureMongo();
    if (coll) {
      const updatedAt = new Date().toISOString();
      const updateDoc = { ...updates, updatedAt };
      const result = await coll.findOneAndUpdate(
        { _id: id },
        { $set: updateDoc },
        { returnDocument: "after" }
      );
      return docToTodo(result.value);
    }

    const todos = await readAllFile();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const updated = {
      ...todos[index],
      ...updates,
      id: todos[index].id,
      createdAt: todos[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    todos[index] = updated;
    await writeAllFile(todos);
    return updated;
  },

  async remove(id) {
    const coll = await ensureMongo();
    if (coll) {
      const res = await coll.deleteOne({ _id: id });
      return res.deletedCount > 0;
    }
    const todos = await readAllFile();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return false;
    todos.splice(index, 1);
    await writeAllFile(todos);
    return true;
  },

  // watchChanges returns a function to close the watcher. Only supported
  // when `MONGO_URI` is provided; otherwise it resolves to a no-op closer.
  async watchChanges(onChange, onError) {
    const coll = await ensureMongo();
    if (!coll) {
      return () => {};
    }
    const changeStream = coll.watch([], { fullDocument: "updateLookup" });
    changeStream.on("change", (c) => onChange(c));
    changeStream.on("error", (e) => onError && onError(e));
    return () => changeStream.close();
  },
};
