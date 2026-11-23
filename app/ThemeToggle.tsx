"use client";

import { Icon } from "./Icon";

export function ThemeToggle() {
  function toggle() {
    const html = document.documentElement;
    const dark = html.dataset.theme ? html.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    html.dataset.theme = dark ? "light" : "dark";
    localStorage.setItem("theme", html.dataset.theme);
  }
  // Both glyphs render; CSS shows the one for the theme you'd switch to.
  return (
    <button type="button" className="theme" onClick={toggle} aria-label="Switch light or dark mode">
      <Icon name="moon" className="to-dark" />
      <Icon name="sun" className="to-light" />
    </button>
  );
}
