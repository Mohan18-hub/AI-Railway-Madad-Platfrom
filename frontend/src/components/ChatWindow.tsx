import React, { useRef, useEffect } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import StatusBadge from "./StatusBadge";
import { Bot, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  activeComplaintNumber?: string;
  activeStatus?: string;
  activeCategory?: string;
  isTyping?: boolean;
  onRefreshStatus?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  activeComplaintNumber,
  activeStatus = "submitted",
  activeCategory,
  isTyping = false,
  onRefreshStatus,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/60 relative">
      {/* Top Header / Complaint Context Bar */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">
                RailMadad AI Grievance Assistant
              </span>
              {activeComplaintNumber && (
                <span className="bg-slate-800 text-sky-400 font-mono text-xs px-2 py-0.5 rounded border border-slate-700">
                  {activeComplaintNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Automated Department Dispatch</span>
              {activeCategory && (
                <>
                  <span>•</span>
                  <span className="capitalize text-amber-400/90 font-medium">
                    {activeCategory.replace("_", " ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge & Refresh */}
        <div className="flex items-center gap-2">
          {activeComplaintNumber && <StatusBadge status={activeStatus} />}
          {onRefreshStatus && (
            <button
              onClick={onRefreshStatus}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh complaint status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">
              File or Track Your Railway Grievance
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Describe your issue in plain language (e.g. cleanliness, AC failure, food quality, or security). Our AI assistant will automatically classify your issue, extract PNR details, and route it to the responsible department.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left w-full text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-amber-400 block mb-1">Cleanliness</span>
                Dirty seats, unwashed toilets, garbage in coach
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-sky-400 block mb-1">Electrical / AC</span>
                Fan not working, AC too cold/hot, charging socket
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              text={m.text}
              timestamp={m.timestamp}
              attachment={m.attachment}
              metadata={m.metadata}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 text-slate-400 text-xs my-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2 flex items-center gap-2 text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing grievance & routing to department...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
