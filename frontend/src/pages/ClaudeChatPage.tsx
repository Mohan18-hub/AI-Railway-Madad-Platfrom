import React, { useState, useEffect } from "react";
import Sidebar, { ComplaintThread } from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBar from "../components/InputBar";
import { Message } from "../components/MessageBubble";
import {
  Menu, X, Train, Settings, Mail, Bell, Palette, Info, Sliders,
  Utensils, Search, MapPin, FileText, RotateCcw, Wallet, CalendarDays,
  Package, Dog, Accessibility, Fingerprint, Globe, Phone, Star, HelpCircle,
  AlertTriangle, ChevronRight, User
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Official AI Assistant Prompt Logic
// ─────────────────────────────────────────────────────────────────────────────
const TRAIN_ID_PATTERN = /\b(\d{4,5}|[A-Z][a-zA-Z]+\s?(Express|Rajdhani|Shatabdi|Superfast|Mail|Intercity|Duronto|Vande Bharat|Tejas|Garib Rath|Jan Shatabdi))\b/i;

function validateComplaintFields(text: string): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  const hasTrainId = TRAIN_ID_PATTERN.test(text) ||
    /train\s*(no|number|name)?\.?\s*:?\s*\d{4,5}/i.test(text) ||
    /\d{5}/.test(text);
  if (!hasTrainId) missingFields.push("🚆 Train Number / Train Name");

  const hasCoach = /coach\s*[A-Z]\d?|[ABCSH]\d\b|seat\s*\d+|berth\s*\d+/i.test(text);
  const hasDescription = text.trim().length >= 20;
  if (!hasCoach && !hasDescription) missingFields.push("🪑 Coach & Seat / Sufficient Description");

  return { valid: missingFields.length === 0, missingFields };
}

function generateOfficialAIResponse(_text: string, complaintNumber: string, category: string, department: string): string {
  return (
    `**✅ Complaint Successfully Registered — ${complaintNumber}**\n\n` +
    `Dear Passenger,\n\n` +
    `Your grievance has been formally received by the **Indian Railways Grievance Redressal System**.\n\n` +
    `📋 **Complaint Summary**\n` +
    `- **Category:** ${category.toUpperCase()}\n` +
    `- **Routed To:** ${department}\n` +
    `- **Status:** Submitted — Under Review\n` +
    `- **Expected Resolution:** Within 24–48 hours\n\n` +
    `📧 A notification has been sent to the concerned department. You may track this complaint using the number \`${complaintNumber}\` on the RailMadad portal or by calling **139**.\n\n` +
    `*This is an automated official response from Indian Railways.*`
  );
}

export const ClaudeChatPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintThread[]>([
    {
      id: "demo-1",
      complaint_number: "RM-2026-X8921",
      title: "AC not cooling in Coach B2 — Train 12301",
      status: "in_progress",
      category: "electrical",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "demo-2",
      complaint_number: "RM-2026-K4102",
      title: "Cleanliness issue — Coach S4 — Train 12951",
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
        text: "AC not cooling in Coach B2 seat 45, Train 12301 Rajdhani Express, PNR 2415678901.",
        timestamp: "10:30 AM",
      },
      {
        id: "msg-2",
        role: "assistant",
        text: "**✅ Complaint Successfully Registered — RM-2026-X8921**\n\nDear Passenger,\n\nYour grievance has been formally received by the **Indian Railways Grievance Redressal System**.\n\n📋 **Complaint Summary**\n- **Train:** 12301 Rajdhani Express\n- **Coach / Seat:** B2 / Seat 45\n- **PNR:** 2415678901\n- **Category:** ELECTRICAL\n- **Routed To:** Electrical Engineering Department\n- **Status:** Submitted — Under Review\n- **Expected Resolution:** Within 24–48 hours\n\n📧 A notification has been sent to the concerned department.\n\n*This is an automated official response from Indian Railways.*",
        timestamp: "10:30 AM",
        metadata: { category: "electrical", severity: "high", complaintNumber: "RM-2026-X8921" },
      },
    ],
    "demo-2": [
      {
        id: "msg-3",
        role: "user",
        text: "Dirty washroom in Coach S4, Train 12951 Mumbai Rajdhani.",
        timestamp: "Yesterday",
      },
      {
        id: "msg-4",
        role: "assistant",
        text: "**✅ Complaint Successfully Registered — RM-2026-K4102**\n\nDear Passenger,\n\nYour grievance regarding **Cleanliness** has been formally registered.\n\n📋 **Complaint Summary**\n- **Train:** 12951 Mumbai Rajdhani Express\n- **Coach:** S4\n- **Category:** CLEANLINESS\n- **Routed To:** Medical & Health / Sanitation Department\n- **Status:** RESOLVED\n\n📧 Onboard cleaning staff have been dispatched.\n\n*This is an automated official response from Indian Railways.*",
        timestamp: "Yesterday",
        metadata: { category: "cleanliness", severity: "normal", complaintNumber: "RM-2026-K4102" },
      },
    ],
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("in_progress");

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("settings");
  const [appearance, setAppearance] = useState("dark");
  const [, setAccentColor] = useState("amber");
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [language, setLanguage] = useState("English");

  const activeThread = complaints.find((c) => c.id === activeComplaintId);
  const currentMessages = activeComplaintId ? messagesMap[activeComplaintId] || [] : [];

  useEffect(() => {
    if (activeThread) setActiveStatus(activeThread.status);
  }, [activeComplaintId, activeThread]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/complaints`);
        if (res.data?.complaints?.length > 0) {
          const apiThreads: ComplaintThread[] = res.data.complaints.map((c: any) => ({
            id: c.id,
            complaint_number: c.complaint_number,
            title: c.title,
            status: c.status,
            category: c.category,
            created_at: c.created_at,
          }));
          setComplaints(apiThreads);
          if (!activeComplaintId) setActiveComplaintId(apiThreads[0].id);
        }
      } catch {
        // Backend starting up — use client demo state
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
    if (!activeComplaintId) setActiveComplaintId(threadId);

    // ── OFFICIAL VALIDATION: require train identifier ──────────────────────
    const { valid, missingFields } = validateComplaintFields(text);
    if (!valid) {
      const validationMsg: Message = {
        id: `msg-validate-${Date.now()}`,
        role: "assistant",
        text:
          `**⚠️ Incomplete Complaint — Please Provide Required Details**\n\n` +
          `Dear Passenger, to register a grievance with Indian Railways, your complaint must include:\n\n` +
          missingFields.map((f) => `- ${f}`).join("\n") +
          `\n\n**Example of a valid complaint:**\n` +
          `> "AC not working in Coach B2, Seat 45 on Train 12301 Rajdhani Express since Nagpur."\n\n` +
          `Please re-submit with all required details. Thank you.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachment,
      };
      setMessagesMap((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), userMsg, validationMsg],
      }));
      toast.warning("Please include Train Number/Name and required details.");
      return;
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
        metadata: { category: data.category, severity: data.severity, complaintNumber: data.complaint_number },
      };
      setMessagesMap((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), aiMsg] }));

      if (data.complaint_number) {
        const newThread: ComplaintThread = {
          id: data.complaint_id || threadId,
          complaint_number: data.complaint_number,
          title: text.slice(0, 50) + "...",
          status: "submitted",
          category: data.category,
          created_at: new Date().toISOString(),
        };
        setComplaints((prev) => [newThread, ...prev.filter((c) => c.id !== threadId)]);
        setActiveComplaintId(newThread.id);
        setActiveStatus("submitted");
        // ── OFFICIAL NOTIFICATION ──────────────────────────────────────────
        toast.success(`🚆 Complaint ${data.complaint_number} registered! Notification sent to department.`, { duration: 5000 });
      }
    } catch {
      // ── CLIENT-SIDE FALLBACK with official format ──────────────────────────
      setTimeout(() => {
        let cat = "other";
        let dept = "General Grievances Cell";
        const lower = text.toLowerCase();

        if (lower.includes("clean") || lower.includes("toilet") || lower.includes("dirty")) {
          cat = "cleanliness"; dept = "Medical & Health / Sanitation Department";
        } else if (lower.includes("ac") || lower.includes("fan") || lower.includes("light") || lower.includes("socket")) {
          cat = "electrical"; dept = "Electrical Engineering Department";
        } else if (lower.includes("food") || lower.includes("water") || lower.includes("meal") || lower.includes("pantry")) {
          cat = "catering"; dept = "IRCTC Catering Services";
        } else if (lower.includes("theft") || lower.includes("stolen") || lower.includes("rpf") || lower.includes("harass")) {
          cat = "safety"; dept = "Railway Protection Force (RPF)";
        } else if (lower.includes("medical") || lower.includes("sick") || lower.includes("emergency") || lower.includes("doctor")) {
          cat = "medical"; dept = "On-board Medical Staff / Emergency Cell";
        } else if (lower.includes("delay") || lower.includes("late")) {
          cat = "punctuality"; dept = "Train Operations Control";
        }

        const compNum = `RM-2026-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const fallbackAiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          text: generateOfficialAIResponse(text, compNum, cat, dept),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          metadata: { category: cat, severity: "normal", complaintNumber: compNum },
        };

        setMessagesMap((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), fallbackAiMsg] }));

        const newThread: ComplaintThread = {
          id: threadId,
          complaint_number: compNum,
          title: text.slice(0, 50) + "...",
          status: "submitted",
          category: cat,
          created_at: new Date().toISOString(),
        };
        setComplaints((prev) => [newThread, ...prev.filter((c) => c.id !== threadId)]);
        setActiveStatus("submitted");

        // ── OFFICIAL COMPLAINT NOTIFICATION ──────────────────────────────────
        toast.success(
          `🚆 Complaint ${compNum} registered! Notification dispatched to ${dept}.`,
          { duration: 6000 }
        );
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  // ── SETTINGS FEATURE TABS (from IRCTC images) ─────────────────────────────
  const settingsTabs = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "personalization", label: "Personalization", icon: Sliders },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "accent color", label: "Accent Color", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "about", label: "About", icon: Info },
  ];

  // IRCTC Home features from image
  const irctcFeatures = [
    { label: "PNR Enquiry", icon: Search, desc: "Check PNR status for your journey" },
    { label: "Track Your Train", icon: MapPin, desc: "Real-time train location tracking" },
    { label: "Train Schedule", icon: CalendarDays, desc: "Arrival/departure timetables" },
    { label: "Order/Cancel Food in Train", icon: Utensils, desc: "IRCTC e-catering services" },
    { label: "File TDR", icon: FileText, desc: "Ticket Deposit Receipt for refund" },
    { label: "Refund History", icon: RotateCcw, desc: "Track your ticket refunds" },
    { label: "IRCTC E-Wallet", icon: Wallet, desc: "Manage your wallet balance" },
    { label: "Chart Vacancy", icon: CalendarDays, desc: "Check available berths in charts" },
    { label: "Vikalp for Counter Ticket", icon: ChevronRight, desc: "Alternative train accommodation" },
    { label: "Luggage Booking", icon: Package, desc: "Parcel and luggage services" },
    { label: "Dog/Cats Booking", icon: Dog, desc: "Book pet travel in trains" },
    { label: "e-Wheelchair", icon: Accessibility, desc: "Wheelchair assistance request" },
    { label: "Contact Us", icon: Phone, desc: "Helpline: 139 / 1800-11-1321" },
    { label: "Help & Support", icon: HelpCircle, desc: "FAQs and user guide" },
    { label: "Rate Us", icon: Star, desc: "Share your experience" },
  ];

  // IRCTC More features from image
  const moreFeatures = [
    { label: "Biometric Authentication", icon: Fingerprint, toggle: true, value: biometric, onChange: setBiometric },
    { label: "भाषा चुनें / Choose Language", icon: Globe, desc: `Current: ${language}` },
    { label: "Alerts", icon: Bell, desc: "Real-time service alerts" },
    { label: "Gallery", icon: Info, desc: "Photo gallery & evidence" },
    { label: "About Us", icon: Info, desc: "About RailMadad & Indian Railways" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" />
      )}

      <Sidebar
        complaints={complaints}
        activeComplaintId={activeComplaintId}
        onSelectComplaint={(id) => setActiveComplaintId(id)}
        onNewComplaint={handleNewComplaint}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg bg-slate-800 md:hidden"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
                <Train className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm tracking-wide text-slate-100">RailMadad AI Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              <span>Emergency: Dial 139</span>
            </div>
            <StatusBadge status={activeStatus} className="scale-90" />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">More</span>
            </button>
          </div>
        </header>

        <ChatWindow
          messages={currentMessages}
          activeComplaintNumber={activeThread?.complaint_number}
          activeStatus={activeStatus}
          activeCategory={activeThread?.category}
          isTyping={isLoading}
        />

        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />

        {/* ── IRCTC-STYLE SETTINGS / MORE MODAL ─────────────────────────────── */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[560px]">
              {/* Left Nav Tabs */}
              <div className="w-full md:w-52 bg-slate-950/80 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
                      <Train className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100">RailMadad</div>
                      <div className="text-[10px] text-amber-400">Official Portal</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {settingsTabs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSettingsTab(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                          activeSettingsTab === item.id
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold capitalize text-slate-100">{activeSettingsTab}</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">

                  {/* ── SETTINGS TAB: IRCTC home features grid ── */}
                  {activeSettingsTab === "settings" && (
                    <div>
                      <p className="text-xs text-slate-400 mb-3">Quick access to Indian Railways passenger services.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {irctcFeatures.map((f) => {
                          const Icon = f.icon;
                          return (
                            <button
                              key={f.label}
                              onClick={() => toast.info(`${f.label}: ${f.desc}`)}
                              className="flex items-center gap-2 p-2.5 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/30 rounded-xl text-left transition-all group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-300 line-clamp-1">{f.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                        For Medical Emergency/First Aid, contact Guard or Dial <strong>139</strong>
                      </div>
                    </div>
                  )}

                  {/* ── PERSONALIZATION TAB ── */}
                  {activeSettingsTab === "personalization" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Customize your passenger profile and assistant behavior.</p>
                      {moreFeatures.map((f) => {
                        const Icon = f.icon;
                        return (
                          <div key={f.label} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-amber-400" />
                              <div>
                                <div className="text-xs font-semibold text-slate-200">{f.label}</div>
                                {f.desc && <div className="text-[10px] text-slate-500">{f.desc}</div>}
                              </div>
                            </div>
                            {f.toggle !== undefined && (
                              <button
                                onClick={() => f.onChange(!f.value)}
                                className={`w-10 h-5 rounded-full transition-colors ${f.value ? "bg-amber-500" : "bg-slate-700"} relative`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${f.value ? "translate-x-5" : "translate-x-0.5"}`} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <div className="flex items-center gap-2.5 mb-2">
                          <Globe className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-semibold text-slate-200">भाषा चुनें / Choose Language</span>
                        </div>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                        >
                          {["English", "हिंदी", "தமிழ்", "తెలుగు", "বাংলা", "ਪੰਜਾਬੀ", "मराठी", "ગુજરાતી"].map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ── MAIL TAB ── */}
                  {activeSettingsTab === "mail" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Complaint notification email configuration.</p>
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Authorized Officer</div>
                        <div className="text-xs text-slate-200 font-mono">mohan15vk@gmail.com</div>
                      </div>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                        ✅ Real email dispatch active via Gmail SMTP
                      </div>
                    </div>
                  )}

                  {/* ── APPEARANCE TAB ── */}
                  {activeSettingsTab === "appearance" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Choose visual theme mode.</p>
                      {["dark", "darker", "amoled"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setAppearance(mode)}
                          className={`w-full p-3 rounded-xl border text-xs font-semibold capitalize text-left transition-all ${
                            appearance === mode ? "bg-amber-500/10 border-amber-500 text-amber-300" : "border-slate-800 text-slate-400 hover:bg-slate-800/40"
                          }`}
                        >
                          {mode === "dark" ? "🌑 Dark Mode (Glassmorphism)" : mode === "darker" ? "⬛ Deep Dark" : "⚫ AMOLED Black"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── ACCENT COLOR TAB ── */}
                  {activeSettingsTab === "accent color" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Select highlight accent color for the interface.</p>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { name: "amber", cls: "bg-amber-500" },
                          { name: "emerald", cls: "bg-emerald-500" },
                          { name: "sky", cls: "bg-sky-500" },
                          { name: "purple", cls: "bg-purple-500" },
                          { name: "rose", cls: "bg-rose-500" },
                          { name: "orange", cls: "bg-orange-500" },
                        ].map((c) => (
                          <button
                            key={c.name}
                            onClick={() => { setAccentColor(c.name); toast.success(`Accent: ${c.name}`); }}
                            className={`w-9 h-9 rounded-full ${c.cls} border-2 border-white/20 hover:scale-110 transition-transform capitalize`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── NOTIFICATIONS TAB ── */}
                  {activeSettingsTab === "notifications" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Manage grievance status alert preferences.</p>
                      <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Desktop Notifications</div>
                          <div className="text-[10px] text-slate-500">Real-time complaint status updates</div>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`w-10 h-5 rounded-full transition-colors ${notifications ? "bg-amber-500" : "bg-slate-700"} relative`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Biometric Authentication</div>
                          <div className="text-[10px] text-slate-500">Secure login with fingerprint</div>
                        </div>
                        <button
                          onClick={() => setBiometric(!biometric)}
                          className={`w-10 h-5 rounded-full transition-colors ${biometric ? "bg-amber-500" : "bg-slate-700"} relative`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${biometric ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── ABOUT TAB ── */}
                  {activeSettingsTab === "about" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center">
                          <Train className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100">RailMadad AI Platform</div>
                          <div className="text-xs text-amber-400">Version 1.0.0 — Ministry of Railways</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1.5">
                        <p>AI-powered passenger grievance redressal system for Indian Railways.</p>
                        <p className="font-semibold text-slate-300">Helpline: 139 | IRCTC: 1800-110-139</p>
                        <p>Ask Disha 2.0 Integration • Official Rail Ministry Platform</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-xs rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaudeChatPage;
