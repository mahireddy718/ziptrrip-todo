import express from "express";
import cors from "cors";
import todosRouter from "./routes/todos.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Simple request logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/todos", todosRouter);
  app.use("/todos", todosRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
