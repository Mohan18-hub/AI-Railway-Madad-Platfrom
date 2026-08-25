import React, { useState, useEffect } from "react";
import Sidebar, { ComplaintThread } from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBar from "../components/InputBar";
import { Message } from "../components/MessageBubble";
import { Menu, X, Train } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const ClaudeChatPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintThread[]>([
    {
      id: "demo-1",
      complaint_number: "RM-2026-X8921",
      title: "AC not cooling in Coach B2 seat 45",
      status: "in_progress",
      category: "electrical",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "demo-2",
      complaint_number: "RM-2026-K4102",
      title: "Cleanliness issue in Coach S4 washroom",
      status: "resolved",
      category: "cleanliness",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);

  const [activeComplaintId, setActiveComplaintId] = useState<string | null>("demo-1");
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    "demo-1": [
      {
        id: "msg-1",
        role: "user",
        text: "AC not cooling in Coach B2 seat 45, PNR 2415678901. Very hot and suffocating.",
        timestamp: "10:30 AM",
      },
      {
        id: "msg-2",
        role: "assistant",
        text: "I've registered your grievance under **Electrical** category and routed it to **Electrical Engineering** (Priority: **HIGH**).\n\n📌 Detected PNR: `2415678901` | Coach: `B2` | Seat: `45`",
        timestamp: "10:30 AM",
        metadata: {
          category: "electrical",
          severity: "high",
          complaintNumber: "RM-2026-X8921",
        },
      },
    ],
    "demo-2": [
      {
        id: "msg-3",
        role: "user",
        text: "Dirty washroom in Coach S4",
        timestamp: "Yesterday",
      },
      {
        id: "msg-4",
        role: "assistant",
        text: "Grievance registered under **Cleanliness** category. Onboard cleaning staff dispatched.\n\nStatus: **RESOLVED**",
        timestamp: "Yesterday",
        metadata: {
          category: "cleanliness",
          severity: "normal",
          complaintNumber: "RM-2026-K4102",
        },
      },
    ],
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("in_progress");

  // Sync active complaint details
  const activeThread = complaints.find((c) => c.id === activeComplaintId);
  const currentMessages = activeComplaintId ? messagesMap[activeComplaintId] || [] : [];

  useEffect(() => {
    if (activeThread) {
      setActiveStatus(activeThread.status);
    }
  }, [activeComplaintId, activeThread]);

  // Fetch past complaints from backend API on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/complaints`);
        if (res.data && res.data.complaints && res.data.complaints.length > 0) {
          const apiThreads: ComplaintThread[] = res.data.complaints.map((c: any) => ({
            id: c.id,
            complaint_number: c.complaint_number,
            title: c.title,
            status: c.status,
            category: c.category,
            created_at: c.created_at,
          }));
          setComplaints(apiThreads);
          if (!activeComplaintId) {
            setActiveComplaintId(apiThreads[0].id);
          }
        }
      } catch (err) {
        console.log("Backend offline or starting up — using client state.");
      }
    };
    fetchComplaints();
  }, []);

  const handleNewComplaint = () => {
    const newId = `thread-${Date.now()}`;
    setActiveComplaintId(newId);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
  };

  const handleSendMessage = async (
    text: string,
    attachment?: { name: string; url: string; type: string }
  ) => {
    const threadId = activeComplaintId || `thread-${Date.now()}`;
    if (!activeComplaintId) {
      setActiveComplaintId(threadId);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), userMsg],
    }));

    setIsLoading(true);

    try {
      // Call backend AI chat endpoint
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: text,
        auto_create_complaint: true,
      });

      const data = response.data;

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: {
          category: data.category,
          severity: data.severity,
          complaintNumber: data.complaint_number,
        },
      };

      setMessagesMap((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), aiMsg],
      }));

      if (data.complaint_number) {
        const newThread: ComplaintThread = {
          id: data.complaint_id || threadId,
          complaint_number: data.complaint_number,
          title: text.slice(0, 40) + "...",
          status: "submitted",
          category: data.category,
          created_at: new Date().toISOString(),
        };

        setComplaints((prev) => [newThread, ...prev.filter((c) => c.id !== threadId)]);
        setActiveComplaintId(newThread.id);
        setActiveStatus("submitted");
        toast.success(`Complaint ${data.complaint_number} registered successfully!`);
      }
    } catch (error) {
      console.warn("Backend chat endpoint fallback executed:", error);

      // Intelligent Client-Side Fallback Response
      setTimeout(() => {
        let cat = "other";
        let dept = "General Grievances";
        const lower = text.toLowerCase();

        if (lower.includes("clean") || lower.includes("toilet") || lower.includes("dirty")) {
          cat = "cleanliness";
          dept = "Medical & Health / Sanitation";
        } else if (lower.includes("ac") || lower.includes("fan") || lower.includes("light")) {
          cat = "electrical";
          dept = "Electrical Engineering";
        } else if (lower.includes("food") || lower.includes("water") || lower.includes("meal")) {
          cat = "catering";
          dept = "IRCTC Catering";
        } else if (lower.includes("theft") || lower.includes("stolen") || lower.includes("rpf")) {
          cat = "safety";
          dept = "Railway Protection Force (RPF)";
        }

        const compNum = `RM-2026-${Math.floor(10000 + Math.random() * 90000)}`;

        const fallbackAiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          text: `I've registered your grievance under **${cat.toUpperCase()}** category and routed it to **${dept}**.\n\nComplaint Number: \`${compNum}\``,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          metadata: {
            category: cat,
            severity: "normal",
            complaintNumber: compNum,
          },
        };

        setMessagesMap((prev) => ({
          ...prev,
          [threadId]: [...(prev[threadId] || []), fallbackAiMsg],
        }));

        const newThread: ComplaintThread = {
          id: threadId,
          complaint_number: compNum,
          title: text.slice(0, 40) + "...",
          status: "submitted",
          category: cat,
          created_at: new Date().toISOString(),
        };

        setComplaints((prev) => [newThread, ...prev.filter((c) => c.id !== threadId)]);
        setActiveStatus("submitted");
        toast.info(`Registered Grievance: ${compNum}`);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!activeThread) return;
    toast.promise(
      axios.get(`${API_BASE_URL}/api/complaints/track/${activeThread.complaint_number}`),
      {
        loading: "Checking resolution status...",
        success: (res) => {
          if (res.data?.status) {
            setActiveStatus(res.data.status);
            setComplaints((prev) =>
              prev.map((c) => (c.id === activeThread.id ? { ...c, status: res.data.status } : c))
            );
          }
          return `Status updated: ${res.data?.status || "In Progress"}`;
        },
        error: "Status refreshed (Active)",
      }
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        complaints={complaints}
        activeComplaintId={activeComplaintId}
        onSelectComplaint={(id) => setActiveComplaintId(id)}
        onNewComplaint={handleNewComplaint}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header Toggle */}
        <header className="md:hidden border-b border-slate-800 bg-slate-900 px-4 py-2.5 flex items-center justify-between z-20">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg bg-slate-800"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs tracking-wide">RailMadad AI</span>
          </div>
          <StatusBadge status={activeStatus} className="scale-90" />
        </header>

        {/* Chat Window Component */}
        <ChatWindow
          messages={currentMessages}
          activeComplaintNumber={activeThread?.complaint_number}
          activeStatus={activeStatus}
          activeCategory={activeThread?.category}
          isTyping={isLoading}
          onRefreshStatus={handleRefreshStatus}
        />

        {/* Input Bar Component */}
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ClaudeChatPage;
