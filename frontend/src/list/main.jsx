import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TodosListPage from "./TodosListPage.jsx";
import "./TodosListPage.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TodosListPage />
  </StrictMode>
);
