import React from "react";
import { Sun, CloudRain } from "lucide-react"; // install via: npm install lucide-react

export default function ThemeSwitcher({ theme, setTheme }) {
  const toggle = () => setTheme(theme === "autumn" ? "rainy" : "autumn");

  return (
    <button className="theme-toggle" onClick={toggle}>
      {theme === "autumn" ? (
        <>
          <CloudRain size={18} /> <span>Rainy Season</span>
        </>
      ) : (
        <>
          <Sun size={18} /> <span>Autumn Season</span>
        </>
      )}
    </button>
  );
}
