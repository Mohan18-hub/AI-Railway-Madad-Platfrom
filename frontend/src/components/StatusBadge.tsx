import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

export type StatusType = "submitted" | "open" | "acknowledged" | "in_progress" | "escalated" | "resolved" | "closed" | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normStatus = (status || "open").toLowerCase().replace("-", "_");

  let badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  let label = "Open";
  let Icon = Clock;

  switch (normStatus) {
    case "submitted":
    case "open":
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      label = "Submitted";
      Icon = Clock;
      break;
    case "acknowledged":
      badgeStyle = "bg-sky-500/10 text-sky-400 border-sky-500/20";
      label = "Acknowledged";
      Icon = Clock;
      break;
    case "in_progress":
      badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse";
      label = "In Progress";
      Icon = Clock;
      break;
    case "escalated":
      badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold";
      label = "Escalated";
      Icon = AlertTriangle;
      break;
    case "resolved":
      badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      label = "Resolved";
      Icon = CheckCircle2;
      break;
    case "closed":
      badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/20";
      label = "Closed";
      Icon = XCircle;
      break;
    default:
      badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      label = status.toUpperCase();
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

export default StatusBadge;
