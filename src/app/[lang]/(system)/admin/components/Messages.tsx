"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function SendMessage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");

  const send = async () => {
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      body: JSON.stringify({ title, content, userId }),
    });

    if (res.ok) {
      toast.success("Message sent 🚀");
      setTitle("");
      setContent("");
      setUserId("");
    }
  };

  return (
    <div className="w-full space-y-4">
        
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border p-2"
      />

      <textarea
        placeholder="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded border p-2"
      />

      <input
        placeholder="User ID (optional)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full rounded border p-2"
      />

      <button onClick={send} className="bg-white text-black rounded-xl px-4 py-2">
        Send
      </button>
    </div>
  );
}