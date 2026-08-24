import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

// ── Types ──────────────────────────────────

export interface Complaint {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  category: string | null;
  status: string;
  severity: string | null;
  pnr_number: string | null;
  coach_number: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintCreate {
  title: string;
  description: string;
  category?: string;
  pnr_number?: string;
  train_number?: string;
  station_code?: string;
  coach_number?: string;
  seat_number?: string;
  journey_date?: string;
  location_lat?: number;
  location_lng?: number;
}

export interface ComplaintListResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardStats {
  total_complaints: number;
  open_complaints: number;
  resolved_today: number;
  average_resolution_hours: number;
  sla_compliance_rate: number;
  top_categories: Array<{ category: string; count: number }>;
  severity_distribution: Record<string, number>;
}

// ── Queries ────────────────────────────────

export function useComplaints(page = 1, pageSize = 20, filters?: Record<string, string>) {
  return useQuery<ComplaintListResponse>({
    queryKey: ["complaints", page, pageSize, filters],
    queryFn: async () => {
      const params = { page, page_size: pageSize, ...filters };
      const { data } = await apiClient.get("/complaints/", { params });
      return data;
    },
  });
}

export function useComplaint(id: string) {
  return useQuery<Complaint>({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/complaints/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTrackComplaint(complaintNumber: string) {
  return useQuery<Complaint>({
    queryKey: ["complaint-track", complaintNumber],
    queryFn: async () => {
      const { data } = await apiClient.get(`/complaints/track/${complaintNumber}`);
      return data;
    },
    enabled: !!complaintNumber,
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/dashboard");
      return data;
    },
  });
}

// ── Mutations ──────────────────────────────

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ComplaintCreate) => {
      const { data } = await apiClient.post("/complaints/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: async ({ complaintId, file }: { complaintId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post(
        `/complaints/${complaintId}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
  });
}
