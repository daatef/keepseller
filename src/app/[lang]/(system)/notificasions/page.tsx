'use client';

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useTranslation } from "@/src/lib/useTranslation";

type Message = {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [shown, setShown] = useState<string[]>([]);
  const { lang } = useParams();
  const t = useTranslation((lang as "en" | "ar"| "fr" | "de") || "en");

  useEffect(() => {
    fetch("/api/messages")
      .then(res => res.json())
      .then(setMessages);
  }, []);

  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.isRead && !shown.includes(msg.id)) {
        toast(msg.title, {
          style: {
            background: "#FACC15", // yellow toast
            color: "#000",
            fontWeight: "bold",
          },
        });
        setShown(prev => [...prev, msg.id]);
      }
    });
  }, [messages]);

  const unreadCount = messages.filter(m => !m.isRead).length;

  const markAsRead = async (id: string) => {
    await fetch("/api/messages/read", {
      method: "POST",
      body: JSON.stringify({ messageId: id }),
    });
    setMessages(prev =>
      prev.map(m => m.id === id ? { ...m, isRead: true } : m)
    );
  };

  const hideMessage = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 relative">
      
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            {unreadCount} {t("new")}
          </span>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          onClick={() => markAsRead(msg.id)}
          className={`relative p-6 rounded-2xl cursor-pointer transition-all shadow-lg 
            ${msg.isRead ? "bg-white/10 text-white" : "bg-yellow-400 text-black"}
            hover:scale-[1.02] hover:shadow-2xl`}
        >
          {/* ❌ Close Button */}
          <button
            onClick={(e) => hideMessage(msg.id, e)}
            className={`absolute top-4 ${lang === "ar" ? "left-4" : "right-4"} 
              text-white hover:text-red-500 font-bold text-lg transition`}
            title={t("remove")}
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-lg font-bold`}>
              {msg.title}
            </h3>
            {!msg.isRead && (
              <span className={`px-2 py-1 text-xs rounded-full font-semibold
                ${lang === "ar" ? "mr-2" : "ml-2"} bg-black text-yellow-400`}>
                {t("new")}
              </span>
            )}
          </div>

          {/* Content */}
          <p className={`text-sm ${msg.isRead ? "text-gray-300" : "text-black/90"}`}>
            {msg.content}
          </p>

          {/* Timestamp */}
          <span className={`text-xs mt-2 block ${msg.isRead ? "text-gray-400" : "text-black/80"}`}>
            {new Date(msg.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
              hour12: true,
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}