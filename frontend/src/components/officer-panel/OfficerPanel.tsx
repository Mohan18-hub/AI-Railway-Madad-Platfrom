/**
 * OfficerPanel — Admin panel for complaint management and officer operations.
 */

import { cn } from "@/lib/utils";
import { formatDate, formatStatus, statusColors, severityColors } from "@/lib/utils";

interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  status: string;
  severity: string | null;
  category: string | null;
  created_at: string;
  sla_deadline?: string;
}

interface OfficerPanelProps {
  complaints: Complaint[];
  onAssign?: (complaintId: string) => void;
  onView?: (complaintId: string) => void;
}

export default function OfficerPanel({ complaints, onAssign, onView }: OfficerPanelProps) {
  return (
    <div className="space-y-4" id="officer-panel">
      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="px-3 py-2 border rounded-md bg-background text-sm"
          id="officer-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
        </select>
        <select
          className="px-3 py-2 border rounded-md bg-background text-sm"
          id="officer-severity-filter"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          type="text"
          placeholder="Search complaints..."
          className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
          id="officer-search-input"
        />
      </div>

      {/* Complaints Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Complaint #</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Severity</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Filed</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className="border-t hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-mono">{complaint.complaint_number}</td>
                <td className="px-4 py-3 text-sm max-w-[200px] truncate">{complaint.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      statusColors[complaint.status] || "bg-gray-100",
                    )}
                  >
                    {formatStatus(complaint.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {complaint.severity && (
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        severityColors[complaint.severity] || "bg-gray-100",
                      )}
                    >
                      {complaint.severity.toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(complaint.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView?.(complaint.id)}
                      className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition"
                      id={`view-${complaint.id}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onAssign?.(complaint.id)}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
                      id={`assign-${complaint.id}`}
                    >
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
