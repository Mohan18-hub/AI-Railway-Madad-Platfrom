import ComplaintForm from "@/components/complaint-form/ComplaintForm";
import { Link } from "react-router-dom";

export default function ComplaintFormPage() {
  return (
    <div className="min-h-screen bg-background" id="complaint-form-page">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚆</span>
            <span className="font-bold text-xl">RailMadad AI</span>
          </Link>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">File a Complaint</h1>
        <p className="text-muted-foreground text-center mb-8">
          Provide your journey and complaint details below.
        </p>
        <ComplaintForm />
      </main>
    </div>
  );
}
