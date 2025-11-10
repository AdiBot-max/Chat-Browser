import React from "react";

export default function ThemeSwitcher({ theme, setTheme }) {
  const toggle = () => setTheme(theme === "autumn" ? "rainy" : "autumn");

  return (
    <button className="theme-toggle" onClick={toggle}>
      {theme === "autumn" ? "Switch to Rainy Season 🌧️" : "Switch to Autumn 🍂"}
    </button>
  );
}


