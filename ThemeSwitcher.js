import React from "react";
import { Sun, CloudRain } from "lucide-react"; // uses lucide-react icons

export default function ThemeSwitcher({ theme, setTheme }) {
  const toggle = () =>
    setTheme(theme === "autumn" ? "rainy" : "autumn");

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label="Toggle Theme"
    >
      {theme === "autumn" ? (
        <>
          <CloudRain size={20} /> <span>Rainy Season</span>
        </>
      ) : (
        <>
          <Sun size={20} /> <span>Autumn Season</span>
        </>
      )}
    </button>
  );
}
