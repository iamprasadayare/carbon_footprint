"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "@/app/providers";
import { MessageCircle, X, Send, Leaf, Loader2, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatAdvisor() {
  const { emissions, points } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🌿 Hi! I'm EcoAdvisor, your AI climate coach. Ask me anything about reducing your carbon footprint, climate change, or how to complete your missions!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          context: emissions
            ? {
                total: emissions.total,
                transit: emissions.transit,
                diet: emissions.diet,
                energy: emissions.energy,
                points,
              }
            : null,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "I couldn't generate a response. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "🌱 I'm temporarily offline. Here's a quick tip: reducing beef consumption by 50% can cut your diet emissions by up to 30%!",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How can I reduce my transit emissions?",
    "What's the impact of a plant-based diet?",
    "How does solar energy help the planet?",
    "What are international climate goals?",
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-slate-800 border border-slate-700 rotate-0"
            : "bg-emerald-500 hover:bg-emerald-400 hover:scale-110"
        }`}
        aria-label="Open EcoAdvisor AI chat"
        id="eco-chat-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-200" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-emerald-500/10 overflow-hidden"
          role="dialog"
          aria-label="EcoAdvisor AI Chat"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-900 bg-slate-950/95 backdrop-blur-md">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-slate-100 text-sm">EcoAdvisor AI</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Powered by Google Vertex AI
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-sm"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-slate-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (only at start) */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInput(prompt);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about climate action..."
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              id="eco-chat-input"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-emerald-400 transition-all cursor-pointer flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
