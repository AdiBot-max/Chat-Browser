import React, { useState, useEffect } from "react";
import Signup from "./Signup.js";
import Login from "./Login.js";
import Chat from "./Chat.js";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "autumn");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="container">
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
      {!user ? (
        <>
          <Signup setUser={setUser} />
          <Login setUser={setUser} />
        </>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
}

