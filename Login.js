import React, { useState } from "react";
import axios from "axios";

const BASE_URL = window.location.origin;

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
      setUser({ username: res.data.username });
    } catch (err) {
      alert(err.response?.data.error || "Error");
    }
  };

  return (
    <div>
      <h3>Login</h3>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
