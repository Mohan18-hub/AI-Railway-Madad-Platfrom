import React, { useState, useRef } from "react";
import { Send, Image, X, Sparkles, Loader2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface InputBarProps {
  onSendMessage: (text: string, attachment?: { name: string; url: string; type: string }) => void;
  isLoading?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading = false }) => {
  const [inputText, setInputText] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; url: string; type: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    if ((!inputText.trim() && !attachment) || isLoading) return;
    onSendMessage(inputText, attachment || undefined);
    setInputText("");
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment({
        name: file.name,
        url,
        type: file.type,
      });
    }
  };

  // Voice Input Speech Recognition Feature
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      toast.info("Voice input stopped.");
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening... Speak your grievance now.");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const quickPrompts = [
    "Coach S4 toilet is dirty",
    "AC not cooling in coach B2",
    "Need medical assistance",
    "Food quality is poor",
    "PNR 2415678901 status",
  ];

  return (
    <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl p-3 md:p-4">
      {/* Quick Prompts Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="shrink-0 text-slate-500 font-medium">Quick suggestions:</span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="shrink-0 bg-slate-800/80 hover:bg-slate-700 hover:text-amber-300 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700/60 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Attachment Preview Badge */}
      {attachment && (
        <div className="mb-2 inline-flex items-center gap-2 bg-slate-800 text-sky-300 px-3 py-1 rounded-lg border border-sky-500/30 text-xs">
          <Image className="w-3.5 h-3.5" />
          <span className="truncate max-w-[180px]">{attachment.name}</span>
          <button
            onClick={() => setAttachment(null)}
            className="text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Box */}
      <div className="flex items-end gap-2 bg-slate-950/80 border border-slate-800 focus-within:border-amber-500/50 rounded-2xl p-2 transition-all shadow-inner">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Upload Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Attach photo/video evidence"
        >
          <Image className="w-5 h-5" />
        </button>

        {/* Voice Input in the Chatbot Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2 rounded-xl transition-colors shrink-0 ${
            isListening
              ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/30"
              : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
          }`}
          title="Voice input in the chatbot"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Controlled Textarea */}
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening... Speak now..." : "Describe your grievance or type your PNR number..."}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-32 py-1.5 px-2"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!inputText.trim() && !attachment) || isLoading}
          className={`p-2.5 rounded-xl text-white font-medium shadow-md transition-all shrink-0 ${
            (!inputText.trim() && !attachment) || isLoading
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white"
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default InputBar;
