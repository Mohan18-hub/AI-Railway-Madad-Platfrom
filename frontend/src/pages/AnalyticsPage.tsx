import { Link } from "react-router-dom";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background" id="analytics-page">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl">RailMadad AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="font-medium hover:text-primary transition">Dashboard</Link>
            <Link to="/officer" className="font-medium hover:text-primary transition">Officer Panel</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            📊 Complaint Trends (Time Series)
          </div>
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            🗺️ Zone-wise Heatmap
          </div>
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            📈 Forecasting (Prophet/LSTM)
          </div>
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            😊 Sentiment Distribution
          </div>
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            ⏱️ SLA Compliance Report
          </div>
          <div className="bg-card border rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
            🏢 Department Performance
          </div>
        </div>
      </main>
    </div>
  );
}
