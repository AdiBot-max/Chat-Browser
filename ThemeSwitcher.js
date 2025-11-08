import React from "react";

export default function ThemeSwitcher({theme,setTheme}){
  const toggle = ()=>setTheme(theme==="green"?"yellow":"green");
  return <button onClick={toggle}>Switch Theme</button>;
}
