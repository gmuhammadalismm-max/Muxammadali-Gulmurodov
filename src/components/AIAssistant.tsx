/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, CornerDownLeft, Sparkles, MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "../types";

const SUGGESTED_CHIPS = [
  { text: "💼 Loyihalarni ko'rish", prompt: "Muxammadali yaratgan asosiy loyihalar (AI Marketing Assistant, PhishDetector, SEO Analyzer Pro) haqida ma'lumot bering." },
  { text: "🔐 Kiberxavfsizlik xizmatlari", prompt: "Muxammadali kiberxavfsizlik bo'yicha qanday professional xizmatlarni (Pentest, xavfsizlik auditi) taklif qiladi?" },
  { text: "📊 AI Marketing nima?", prompt: "Muxammadali raqamli marketing va AI avtomatlashtirish sohasida qanday yordam bera oladi?" },
  { text: "📞 Bog'lanish kanallari", prompt: "Muxammadali bilan qanday aloqaga chiqish va ish bo'yicha maslahatlashish mumkin?" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: "Salom! Men Muxammadalining portfoliosidagi sun'iy intellekt bo'yicha aqlli yordamchisiman. 🚀\n\nMen orqali Muxammadalining loyihalari, marketing ko'nikmalari yoki kiberxavfsizlik xizmatlari haqida bilib olishingiz mumkin. Sizga nima bo'yicha ma'lumot beray?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message within the chat messages frame container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorText("");
    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Prepare history format
    const history = messages
      .filter((m) => m.id !== "initial")
      .map((m) => ({
        role: m.role,
        text: m.text,
      }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history }),
      });

      if (!response.ok) {
        throw new Error("Chat server error");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Failed to connect to assistant backend:", err);
      setErrorText("Afsuski, internet yoki serverga ulanish xatoligi yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: "initial",
        role: "model",
        text: "Salom! Men Muxammadalining portfoliosidagi sun'iy intellekt bo'yicha aqlli yordamchisiman. 🚀\n\nMen orqali Muxammadalining loyihalari, marketing ko'nikmalari yoki kiberxavfsizlik xizmatlari haqida bilib olishingiz mumkin. Sizga nima bo'yicha ma'lumot beray?",
        timestamp: new Date(),
      },
    ]);
    setErrorText("");
  };

  return (
    <div id="ai-assistant-wrapper" className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative min-h-[480px]">
      
      {/* Bot Chat Header */}
      <div className="flex justify-between items-center bg-slate-900/60 border-b border-slate-900 px-5 py-3.5 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <Bot className="w-5 h-5 text-slate-950 stroke-[2]" />
            </div>
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-tight">AI Portfolio Agent</h4>
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[9px] uppercase border border-cyan-800/40 font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Active 3.5</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Gulmurodov AI Assistant</span>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          title="Tarixni tozalash"
          className="p-1.5 border border-slate-800 rounded bg-slate-900/40 text-slate-400 hover:text-slate-200 transition duration-300 hover:border-slate-700 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message Output Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[380px] scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : "justify-start"}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md ${isUser ? "bg-cyan-950/60 border border-cyan-800 text-cyan-400" : "bg-slate-900 border border-slate-800 text-slate-400"}`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Text Bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs text-slate-200 leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-br from-cyan-950/80 to-slate-900/90 border border-cyan-900/60 shadow-lg shadow-cyan-950/25"
                    : "bg-slate-900/50 border border-slate-800/40"
                }`}
              >
                {/* Standard Text or Markdown Renderer */}
                <div className="markdown-body">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
                <span className="text-[8px] text-slate-500 font-mono mt-1.5 block text-right">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Streaming/Loading State Indicator */}
        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="bg-slate-900/35 border border-slate-850 rounded-xl px-4 py-3 flex space-x-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorText && (
          <div className="flex items-center space-x-2 bg-rose-950/20 border border-rose-900/60 text-rose-300 rounded-lg p-3 text-xs font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      {/* Suggested Instant Chat Prompt Chips */}
      <div className="px-5 py-2.5 border-t border-slate-950 bg-slate-950">
        <div className="flex space-x-2 overflow-x-auto scrollbar-none py-1 -mx-2 px-2">
          {SUGGESTED_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              disabled={loading}
              className="shrink-0 font-sans text-[10px] font-medium px-3 py-1.5 border border-slate-900 rounded-full bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-slate-100 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chip.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Text Input Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="border-t border-slate-900 p-3 bg-slate-900/40 backdrop-blur-sm"
      >
        <div className="relative flex items-center bg-slate-950 rounded-xl border border-slate-900 focus-within:border-cyan-500/50 transition duration-300 px-3 py-2">
          <MessageSquare className="w-4 h-4 text-slate-500 grow-0 mr-2" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Muxammadalining loyihalari yoki tajribasi haqida so'rang..."
            className="flex-1 text-xs text-slate-200 bg-transparent focus:outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-7 w-7 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-slate-950 flex items-center justify-center cursor-pointer transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed grow-0 ml-1.5"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono mt-1 px-1">
          <span>O'zbek tili, Rus tili yoki Ingliz tili qo'llab-quvvatlanadi</span>
          <span className="flex items-center gap-0.5">
            Enter <CornerDownLeft className="w-2.5 h-2.5 text-slate-700" />
          </span>
        </div>
      </form>
    </div>
  );
}
