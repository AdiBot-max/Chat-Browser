import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./styles.css";

const socket = io("http://localhost:5000");

export default function Chat({ user }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [to, setTo] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadFriends = async () => {
    const res = await axios.get(`http://localhost:5000/users/friends/${user.username}`);
    setFriends(res.data.friends);
    setRequests(res.data.requests);
  };

  useEffect(() => {
    loadFriends();
    socket.emit("login", user.username);
    socket.on("receiveMessage", (msg) => setChat(prev=>[...prev,msg]));
    return ()=>socket.off("receiveMessage");
  }, [user]);

  useEffect(()=>{scrollToBottom();}, [chat]);

  const sendMessage = ()=>{
    if(!to||!message) return;
    socket.emit("sendMessage",{from:user.username,to,message});
    setMessage("");
  };

  const sendRequest = async (friend)=>{
    if(!friend) return;
    try{
      await axios.post("http://localhost:5000/users/request",{from:user.username,to:friend});
      alert(`Friend request sent to ${friend}`);
    }catch(err){alert(err.response?.data.error||"Error");}
  };

  const acceptRequest = async(friend)=>{
    try{
      await axios.post("http://localhost:5000/users/accept",{from:friend,to:user.username});
      loadFriends();
    }catch(err){alert(err.response?.data.error||"Error");}
  };

  return (
    <div className="chat-container">
      <div className="friends-section">
        <h3>Friends</h3>
        <ul className="friend-list">{friends.map(f=><li key={f}>{f}</li>)}</ul>
        <h4>Requests</h4>
        <ul className="request-list">{requests.map(r=><li key={r}>{r} <button onClick={()=>acceptRequest(r)}>Accept</button></li>)}</ul>
        <input placeholder="Add friend by username" onKeyDown={e=>{if(e.key==="Enter"){sendRequest(e.target.value); e.target.value=""}}}/>
      </div>

      <div className="chat-section">
        <h3>Chat</h3>
        <input placeholder="Send to (username)" value={to} onChange={e=>setTo(e.target.value)}/>
        <div className="chat-box">{chat.map((m,i)=><div key={i}><b>{m.from}:</b> {m.message}</div>)}<div ref={chatEndRef}></div></div>
        <input placeholder="Type your message..." value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMessage()}}/>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
