export const ai_intelligence_service_test = {
  classify: (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("toilet") || lower.includes("dirty") || lower.includes("clean")) {
      return { category: "cleanliness", department: "Medical & Health / Sanitation" };
    }
    if (lower.includes("ac") || lower.includes("fan")) {
      return { category: "electrical", department: "Electrical Engineering" };
    }
    return { category: "other", department: "General Grievances" };
  },

  detectSeverity: (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("fire") || lower.includes("emergency")) return { severity: "critical" };
    if (lower.includes("stolen") || lower.includes("theft")) return { severity: "high" };
    return { severity: "medium" };
  },

  extractDetails: (text: string) => {
    const pnrMatch = text.match(/\b\d{10}\b/);
    const coachMatch = text.match(/\b([SBAHDE]\d{1,2}|B\d|S\d|A\d)\b/i);
    const seatMatch = text.match(/\b(seat|berth)\s*#?\s*(\d{1,3})\b/i);

    return {
      pnr: pnrMatch ? pnrMatch[0] : null,
      coach: coachMatch ? coachMatch[0].toUpperCase() : null,
      seat: seatMatch ? seatMatch[2] : null,
    };
  },
};
