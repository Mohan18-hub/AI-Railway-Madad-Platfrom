/**
 * ChatbotWidget — AI-powered chatbot / RAG assistant.
 *
 * ⚠ PLACEMENT IS TBD — see clarification question #4.
 * This component is generated but NOT embedded into any layout yet.
 * Once placement is decided, integrate accordingly:
 *   - Floating widget: Add to root App.tsx with position: fixed
 *   - Dedicated page: Create /assistant route
 *   - Sidebar panel: Integrate into dashboard shell
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your RailMadad AI Assistant. I can help you with:\n• Filing a complaint\n• Tracking complaint status\n• Finding train/station information\n• Answering questions about Indian Railways\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Integrate with LangChain/LangGraph RAG backend
    // POST /api/v1/chatbot/message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm still being set up. The AI backend will be connected soon!",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div
      className="flex flex-col h-[500px] w-[380px] bg-card border rounded-xl shadow-xl overflow-hidden"
      id="chatbot-widget"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
          🤖
        </div>
        <div>
          <p className="font-semibold text-sm">RailMadad AI Assistant</p>
          <p className="text-xs opacity-80">Powered by AI</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted rounded-bl-sm",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm"
            id="chatbot-input"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            id="chatbot-send-btn"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
