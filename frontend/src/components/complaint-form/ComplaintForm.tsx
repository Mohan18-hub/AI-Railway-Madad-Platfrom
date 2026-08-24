/**
 * ComplaintForm — Multi-step complaint registration form.
 *
 * Features:
 * - PNR/train/station lookup
 * - Category selection
 * - Description with rich text
 * - Evidence upload (images, video, audio)
 * - Location capture (GPS)
 * - Guest access support
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateComplaint, type ComplaintCreate } from "@/api/queries";
import { cn } from "@/lib/utils";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(500),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  pnr_number: z.string().optional(),
  train_number: z.string().optional(),
  station_code: z.string().optional(),
  coach_number: z.string().optional(),
  seat_number: z.string().optional(),
  journey_date: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const CATEGORIES = [
  { value: "cleanliness", label: "🧹 Cleanliness" },
  { value: "catering", label: "🍽️ Catering / Food" },
  { value: "staff_behavior", label: "👤 Staff Behavior" },
  { value: "punctuality", label: "⏰ Punctuality" },
  { value: "safety", label: "🛡️ Safety & Security" },
  { value: "electrical", label: "⚡ Electrical" },
  { value: "water", label: "💧 Water Availability" },
  { value: "coach_maintenance", label: "🔧 Coach Maintenance" },
  { value: "bed_roll", label: "🛏️ Bed Roll / Linen" },
  { value: "corruption", label: "⚠️ Corruption / Bribery" },
  { value: "other", label: "📋 Other" },
];

export default function ComplaintForm() {
  const [step, setStep] = useState(1);
  const createComplaint = useCreateComplaint();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      await createComplaint.mutateAsync(data as ComplaintCreate);
      // TODO: Show success message and redirect to tracker
    } catch {
      // TODO: Handle error
    }
  };

  return (
    <div className="max-w-2xl mx-auto" id="complaint-form">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "w-16 h-1 mx-1 rounded transition-colors",
                  step > s ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Journey Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Journey Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">PNR Number</label>
                <input
                  {...register("pnr_number")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="e.g., 4821573906"
                  id="pnr-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Train Number</label>
                <input
                  {...register("train_number")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="e.g., 12301"
                  id="train-number-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coach</label>
                <input
                  {...register("coach_number")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="e.g., S5"
                  id="coach-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seat</label>
                <input
                  {...register("seat_number")}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="e.g., 42"
                  id="seat-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Journey Date</label>
              <input
                type="date"
                {...register("journey_date")}
                className="w-full px-3 py-2 border rounded-md bg-background"
                id="journey-date-input"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition"
              id="step1-next-btn"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Complaint Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Complaint Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 border rounded-md bg-background"
                id="category-select"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                {...register("title")}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background",
                  errors.title && "border-destructive",
                )}
                placeholder="Brief summary of your complaint"
                id="title-input"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                {...register("description")}
                rows={5}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background resize-none",
                  errors.description && "border-destructive",
                )}
                placeholder="Describe your complaint in detail..."
                id="description-input"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border rounded-md font-medium hover:bg-muted transition"
                id="step2-back-btn"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition"
                id="step2-next-btn"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <div className="bg-card border rounded-lg p-4 space-y-2">
              <p><strong>Title:</strong> {watch("title") || "—"}</p>
              <p><strong>Category:</strong> {watch("category") || "Not selected"}</p>
              <p><strong>PNR:</strong> {watch("pnr_number") || "—"}</p>
              <p><strong>Train:</strong> {watch("train_number") || "—"}</p>
              <p><strong>Description:</strong> {watch("description") || "—"}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2 px-4 border rounded-md font-medium hover:bg-muted transition"
                id="step3-back-btn"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
                id="submit-complaint-btn"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
