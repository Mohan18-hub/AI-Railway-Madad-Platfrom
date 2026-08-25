import React, { useRef, useEffect } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import { Bot, Sparkles, Loader2, Train, AlertTriangle } from "lucide-react";

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
  activeCategory,
  isTyping = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/60 relative">
      {/* Official Assistant Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/30 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">
                Indian Railways Official Assistant
              </span>
              {activeComplaintNumber && (
                <span className="bg-slate-800 text-sky-400 font-mono text-xs px-2 py-0.5 rounded border border-slate-700">
                  {activeComplaintNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Grievance Redressal System — Ministry of Railways</span>
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

        {/* Official Dial 139 badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span>Emergency: Dial 139</span>
        </div>
      </div>

      {/* Message Feed Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
              <Train className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">
              Welcome to Indian Railways Grievance Portal
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              This is an <strong className="text-amber-300">official Indian Railways complaint assistant</strong>. 
              To register a grievance, please provide your <strong className="text-sky-300">Train Number / Name</strong>, 
              coach, seat, and a description of the issue.
            </p>

            {/* Required Information Card */}
            <div className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4 text-left">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                ⚠ Mandatory Information Required
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                <li>🚆 <strong>Train Number / Train Name</strong> (e.g., 12345 / Rajdhani Express)</li>
                <li>🪑 <strong>Coach & Seat Number</strong> (e.g., B2, Seat 45)</li>
                <li>📋 <strong>PNR Number</strong> (optional but recommended)</li>
                <li>📝 <strong>Detailed Description</strong> of the issue</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left w-full text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-amber-400 block mb-1">🧹 Cleanliness</span>
                Dirty seats, unwashed toilets, garbage in coach
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-sky-400 block mb-1">❄️ Electrical / AC</span>
                Fan not working, AC too cold/hot, charging socket
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">🍱 Catering</span>
                Food quality, overcharging, unhygienic meals
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-rose-400 block mb-1">🚔 Security / RPF</span>
                Theft, harassment, suspicious activity
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/30 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-amber-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Official grievance being processed & routed to department...</span>
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom official disclaimer */}
      <div className="px-4 py-1.5 bg-slate-950/80 border-t border-slate-900 text-center text-[10px] text-slate-600">
        <Sparkles className="w-3 h-3 inline mr-1 text-amber-500/40" />
        For Medical Emergency/First Aid, contact Ticket Checking Staff/Guard or Dial 139
      </div>
    </div>
  );
};

export default ChatWindow;
