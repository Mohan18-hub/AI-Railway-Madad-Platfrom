import React from "react";
import { Bot, User, Paperclip } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;

  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  metadata?: {
    category?: string;
    severity?: string;
    complaintNumber?: string;
  };
}

interface MessageBubbleProps {
  role?: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  metadata?: {
    category?: string;
    severity?: string;
    complaintNumber?: string;
  };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role = "user",
  text,
  timestamp,
  attachment,
  metadata,
}) => {
  const isUser = role === "user";

  // Simple markdown renderer for bold, code, and list items
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, lineIdx) => {
      // Process bold **text** and code `text`
      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-amber-300">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <span key={lineIdx} className="block min-h-[1.25rem]">
          {lineContent}
        </span>
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-3 my-2 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-md ${
          isUser
            ? "bg-gradient-to-tr from-amber-600 to-orange-500 text-white"
            : "bg-gradient-to-tr from-sky-600 to-indigo-600 text-white"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm border ${
          isUser
            ? "bg-amber-500/10 border-amber-500/20 text-slate-100 rounded-tr-none"
            : "bg-slate-800/90 border-slate-700/60 text-slate-200 rounded-tl-none backdrop-blur-md"
        }`}
      >
        {/* Attachment preview if present */}
        {attachment && (
          <div className="mb-3 p-2 bg-slate-900/60 rounded-lg border border-slate-700/50 flex items-center gap-2">
            {attachment.type?.startsWith("image") ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-48 rounded object-cover border border-slate-700"
              />
            ) : (
              <div className="flex items-center gap-2 text-xs text-sky-400">
                <Paperclip className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{attachment.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Text Body */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {renderFormattedText(text)}
        </div>

        {/* Metadata pills if attached */}
        {metadata && (metadata.complaintNumber || metadata.category) && (
          <div className="mt-3 pt-2 border-t border-slate-700/40 flex flex-wrap gap-2 text-[11px] text-slate-400">
            {metadata.complaintNumber && (
              <span className="bg-slate-900/80 px-2 py-0.5 rounded text-sky-400 border border-slate-700 font-mono">
                {metadata.complaintNumber}
              </span>
            )}
            {metadata.category && (
              <span className="bg-slate-900/80 px-2 py-0.5 rounded text-amber-300 border border-slate-700 capitalize">
                {metadata.category.replace("_", " ")}
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div
            className={`text-[10px] mt-1.5 text-slate-500 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
