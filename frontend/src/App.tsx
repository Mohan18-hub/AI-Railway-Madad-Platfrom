import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Pages
import ClaudeChatPage from "@/pages/ClaudeChatPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ComplaintFormPage from "@/pages/ComplaintFormPage";
import ComplaintTrackerPage from "@/pages/ComplaintTrackerPage";
import DashboardPage from "@/pages/DashboardPage";
import OfficerPanelPage from "@/pages/OfficerPanelPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import NotFoundPage from "@/pages/NotFoundPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ClaudeChatPage />} />
        <Route path="/chat" element={<ClaudeChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/complaint/new" element={<ComplaintFormPage />} />
        <Route path="/complaint/track" element={<ComplaintTrackerPage />} />
        <Route path="/complaint/track/:complaintNumber" element={<ComplaintTrackerPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/officer" element={<OfficerPanelPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

