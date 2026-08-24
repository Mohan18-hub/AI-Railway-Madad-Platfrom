import OfficerPanel from "@/components/officer-panel/OfficerPanel";
import { Link } from "react-router-dom";

const DEMO_COMPLAINTS = [
  {
    id: "1",
    complaint_number: "RM-2024-00142",
    title: "Unclean toilet in coach S5",
    status: "submitted",
    severity: "medium",
    category: "cleanliness",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    complaint_number: "RM-2024-00143",
    title: "AC not working in coach A1",
    status: "in_progress",
    severity: "high",
    category: "coach_maintenance",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    complaint_number: "RM-2024-00144",
    title: "Rude behavior by TTE",
    status: "escalated",
    severity: "critical",
    category: "staff_behavior",
    created_at: new Date().toISOString(),
  },
];

export default function OfficerPanelPage() {
  return (
    <div className="min-h-screen bg-background" id="officer-panel-page">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl">RailMadad AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="font-medium hover:text-primary transition">Dashboard</Link>
            <Link to="/analytics" className="font-medium hover:text-primary transition">Analytics</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Officer Panel</h1>
        <OfficerPanel complaints={DEMO_COMPLAINTS} />
      </main>
    </div>
  );
}
