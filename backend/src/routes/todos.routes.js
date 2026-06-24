import { Router } from "express";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todos.controller.js";

const router = Router();

router.get("/", listTodos);
router.get("/:id", getTodo);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.patch("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
