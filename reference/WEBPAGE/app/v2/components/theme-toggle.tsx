"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  }

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 transition-colors duration-200 hover:bg-[var(--color-surface)]"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? (
        <Moon className="h-5 w-5 text-[var(--color-text-secondary)]" />
      ) : (
        <Sun className="h-5 w-5 text-[var(--color-text-secondary)]" />
      )}
    </button>
  );
}
