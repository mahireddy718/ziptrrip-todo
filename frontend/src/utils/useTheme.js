import { useState } from "react";

/**
 * Reusable hook to manage and persist theme selection (light/dark mode) across pages.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Read initial theme set by the early head script, falling back to light
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("todo-theme", nextTheme);
  };

  return [theme, toggleTheme];
}
