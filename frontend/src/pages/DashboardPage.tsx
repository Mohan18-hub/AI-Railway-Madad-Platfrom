import DashboardCards from "@/components/dashboard-cards/DashboardCards";
import { Link } from "react-router-dom";

// Demo stats for scaffold
const DEMO_STATS = {
  total_complaints: 12847,
  open_complaints: 342,
  resolved_today: 58,
  average_resolution_hours: 18.5,
  sla_compliance_rate: 94.2,
  top_categories: [
    { category: "cleanliness", count: 3241 },
    { category: "catering", count: 2156 },
    { category: "punctuality", count: 1897 },
  ],
  severity_distribution: {
    low: 4521,
    medium: 5123,
    high: 2456,
    critical: 747,
  },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background" id="dashboard-page">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl">RailMadad AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/officer" className="font-medium hover:text-primary transition">Officer Panel</Link>
            <Link to="/analytics" className="font-medium hover:text-primary transition">Analytics</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <DashboardCards stats={DEMO_STATS} />

        {/* Placeholder for charts */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-card border rounded-xl p-6 h-80 flex items-center justify-center text-muted-foreground">
            📊 Complaint Trends Chart (Recharts / Chart.js)
          </div>
          <div className="bg-card border rounded-xl p-6 h-80 flex items-center justify-center text-muted-foreground">
            📈 Category Distribution Chart
          </div>
        </div>
      </main>
    </div>
  );
}
