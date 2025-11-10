import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io();

export default function Chat({ username, currentFriend }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("login", username);
  }, [username]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      // only show relevant chat
      if (
        (msg.from === username && msg.to === currentFriend) ||
        (msg.from === currentFriend && msg.to === username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receiveMessage");
  }, [username, currentFriend]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { from: username, to: currentFriend, text: message });
    setMessage("");
  };

  return (
    <div className="chat-box">
      <div className="messages" style={{ height: "250px", overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Message ${currentFriend}`}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
