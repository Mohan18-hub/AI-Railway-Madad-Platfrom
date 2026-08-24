/**
 * ComplaintTracker — Search and display complaint status by complaint number.
 */

import { useState } from "react";
import { useTrackComplaint } from "@/api/queries";
import StatusTimeline from "@/components/status-timeline/StatusTimeline";
import { formatDate, formatStatus, statusColors, severityColors } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ComplaintTracker() {
  const [searchInput, setSearchInput] = useState("");
  const [complaintNumber, setComplaintNumber] = useState("");

  const { data: complaint, isLoading, isError } = useTrackComplaint(complaintNumber);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintNumber(searchInput.trim());
  };

  return (
    <div className="max-w-2xl mx-auto" id="complaint-tracker">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter Complaint Number (e.g., RM-2024-00001)"
          className="flex-1 px-4 py-3 border rounded-lg bg-background text-lg"
          id="track-search-input"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          id="track-search-btn"
        >
          Track
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Looking up your complaint...</p>
        </div>
      )}

      {/* Error State */}
      {isError && complaintNumber && (
        <div className="text-center py-12 text-destructive">
          <p className="text-lg font-medium">Complaint not found</p>
          <p className="text-muted-foreground mt-2">
            Please check the complaint number and try again.
          </p>
        </div>
      )}

      {/* Complaint Details */}
      {complaint && (
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{complaint.complaint_number}</p>
                <h2 className="text-xl font-semibold mt-1">{complaint.title}</h2>
              </div>
              <div className="flex gap-2">
                {complaint.severity && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      severityColors[complaint.severity] || "bg-gray-100",
                    )}
                  >
                    {complaint.severity.toUpperCase()}
                  </span>
                )}
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    statusColors[complaint.status] || "bg-gray-100",
                  )}
                >
                  {formatStatus(complaint.status)}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">{complaint.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Filed:</span>{" "}
                {formatDate(complaint.created_at)}
              </div>
              <div>
                <span className="text-muted-foreground">Last Update:</span>{" "}
                {formatDate(complaint.updated_at)}
              </div>
              {complaint.pnr_number && (
                <div>
                  <span className="text-muted-foreground">PNR:</span> {complaint.pnr_number}
                </div>
              )}
              {complaint.coach_number && (
                <div>
                  <span className="text-muted-foreground">Coach:</span> {complaint.coach_number}
                </div>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <StatusTimeline complaintId={complaint.id} />
        </div>
      )}
    </div>
  );
}
