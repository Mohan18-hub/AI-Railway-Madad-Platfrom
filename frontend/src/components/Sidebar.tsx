import React from "react";
import { Plus, MessageSquare, Search, Train, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";

export interface ComplaintThread {
  id: string;
  complaint_number: string;
  title: string;
  status: string;
  category?: string;
  created_at?: string;
  lastMessage?: string;
}

interface SidebarProps {
  complaints: ComplaintThread[];
  activeComplaintId: string | null;
  onSelectComplaint: (id: string) => void;
  onNewComplaint: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  complaints,
  activeComplaintId,
  onSelectComplaint,
  onNewComplaint,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredComplaints = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
        isOpenMobile ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Sidebar Header & Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-wide">RailMadad AI</h1>
            <span className="text-[10px] text-amber-400 font-medium">Passenger Assistant</span>
          </div>
        </div>
      </div>

      {/* New Complaint Button */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewComplaint();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past complaints..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2">
        <div className="px-2 pb-1 text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
          Complaint History ({filteredComplaints.length})
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            No complaints found. Start a new complaint to track grievances.
          </div>
        ) : (
          filteredComplaints.map((item) => {
            const isActive = item.id === activeComplaintId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectComplaint(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border group ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                    : "bg-slate-950/30 border-transparent hover:bg-slate-800/60 hover:border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[11px] font-medium text-sky-400 truncate">
                    {item.complaint_number}
                  </span>
                  <StatusBadge status={item.status} className="scale-90 origin-right" />
                </div>
                <div className="text-xs font-medium line-clamp-1 text-slate-200 group-hover:text-amber-300">
                  {item.title}
                </div>
                {item.created_at && (
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Indian Railways Redressal</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600">v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
