import { useEffect, useState } from "react";

const KEY = "ths-theme";
const EVENT = "ths-theme";

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.style.colorScheme = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTheme() {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState(getTheme);
  useEffect(() => {
    applyTheme(getTheme());
    const sync = () => setTheme(getTheme());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return theme;
}
