/**
 * HomePage — Landing page for RailMadad AI Platform.
 */

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen" id="home-page">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl">RailMadad AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/complaint/track" className="text-sm font-medium hover:text-primary transition">
              Track Complaint
            </Link>
            <Link
              to="/complaint/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
              id="file-complaint-btn"
            >
              File Complaint
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
          🤖 Powered by AI
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Railway Grievance Redressal,{" "}
          <span className="text-primary">Reimagined with AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
          Register complaints, track resolution in real-time, and get AI-powered
          assistance for a smoother railway experience.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <Link
            to="/complaint/new"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
            id="hero-file-complaint-btn"
          >
            File a Complaint
          </Link>
          <Link
            to="/complaint/track"
            className="px-8 py-3 border-2 border-primary text-primary rounded-xl text-lg font-semibold hover:bg-primary/5 transition"
            id="hero-track-btn"
          >
            Track Status
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📝",
              title: "Register Complaint",
              desc: "File your complaint with journey details, photos, and voice recordings.",
            },
            {
              icon: "🤖",
              title: "AI Classification",
              desc: "Our AI automatically classifies, prioritizes, and routes your complaint.",
            },
            {
              icon: "📊",
              title: "Track & Resolve",
              desc: "Track real-time status updates and get notified when resolved.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-card border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 RailMadad AI Platform. AI-powered railway grievance redressal.</p>
        </div>
      </footer>
    </div>
  );
}
