/**
 * StatusTimeline — Visual timeline of complaint status changes.
 */

import { cn } from "@/lib/utils";
import { formatDate, formatStatus } from "@/lib/utils";

interface StatusEvent {
  id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  remarks: string | null;
  created_at: string;
}

interface StatusTimelineProps {
  complaintId: string;
  events?: StatusEvent[];
}

const STATUS_ICONS: Record<string, string> = {
  submitted: "📝",
  acknowledged: "👍",
  in_progress: "⚙️",
  escalated: "🚨",
  resolved: "✅",
  closed: "🔒",
  reopened: "🔄",
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "border-indigo-500 bg-indigo-500",
  acknowledged: "border-blue-500 bg-blue-500",
  in_progress: "border-yellow-500 bg-yellow-500",
  escalated: "border-red-500 bg-red-500",
  resolved: "border-green-500 bg-green-500",
  closed: "border-gray-500 bg-gray-500",
  reopened: "border-orange-500 bg-orange-500",
};

// Demo events for scaffold — replace with API data
const DEMO_EVENTS: StatusEvent[] = [
  {
    id: "1",
    previous_status: null,
    new_status: "submitted",
    changed_by: null,
    remarks: "Complaint registered successfully",
    created_at: new Date().toISOString(),
  },
];

export default function StatusTimeline({ complaintId, events }: StatusTimelineProps) {
  const timelineEvents = events || DEMO_EVENTS;

  return (
    <div className="bg-card border rounded-xl p-6" id="status-timeline">
      <h3 className="text-lg font-semibold mb-6">Status Timeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="flex gap-4 relative">
              {/* Dot */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm z-10 bg-background",
                  STATUS_COLORS[event.new_status] || "border-gray-300",
                )}
              >
                <span className="text-xs">
                  {STATUS_ICONS[event.new_status] || "•"}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {formatStatus(event.new_status)}
                  </span>
                  {event.previous_status && (
                    <span className="text-xs text-muted-foreground">
                      from {formatStatus(event.previous_status)}
                    </span>
                  )}
                </div>
                {event.remarks && (
                  <p className="text-sm text-muted-foreground mt-1">{event.remarks}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(event.created_at)}
                  {event.changed_by && ` • by ${event.changed_by}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
