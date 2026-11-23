"use client";

export function ThemeToggle() {
  function toggle() {
    const html = document.documentElement;
    const dark = html.dataset.theme ? html.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    html.dataset.theme = dark ? "light" : "dark";
    localStorage.setItem("theme", html.dataset.theme);
  }
  return (
    <button type="button" className="theme" onClick={toggle} aria-label="Toggle dark mode">
      ◐ Theme
    </button>
  );
}
