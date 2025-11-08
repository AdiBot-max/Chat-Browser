import React, { useState, useEffect } from "react";
import Signup from "./Signup.js";
import Login from "./Login.js";
import Chat from "./Chat.js";
import ThemeSwitcher from "./ThemeSwitcher.js";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("green");

  useEffect(()=>{
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className="container">
      <ThemeSwitcher theme={theme} setTheme={setTheme}/>
      {!user ? (
        <>
          <Signup setUser={setUser}/>
          <Login setUser={setUser}/>
        </>
      ):(
        <Chat user={user}/>
      )}
    </div>
  );
}
