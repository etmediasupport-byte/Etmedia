import { Component, ErrorInfo, ReactNode, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/site/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import MagazinePage from "@/pages/MagazinePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import DelegateRegistrationPage from "@/pages/DelegateRegistrationPage";
import ContactPage from "@/pages/ContactPage";
import PartnerWithUsPage from "@/pages/PartnerWithUsPage";
import CareersPage from "@/pages/CareersPage";
import GalleryPage from "@/pages/GalleryPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import { HelmetProvider } from "react-helmet-async";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import VerifyPassPage from "@/pages/VerifyPassPage";
import EventRegistrationWizardPage from "@/pages/EventRegistrationWizardPage";
import RegistrationSuccessPage from "@/pages/RegistrationSuccessPage";
import { Toaster } from "@/components/ui/sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 font-sans">
          <div className="max-w-md w-full rounded-3xl bg-slate-800 border border-slate-700 p-8 shadow-2xl text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Application Notice</h2>
            <p className="text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl break-words text-left max-h-32 overflow-y-auto">
              {this.state.error?.message || "An unexpected error occurred while loading this page."}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem("etmedia_admin_token");
                  localStorage.removeItem("etmedia_admin_user");
                  window.location.href = "/admin/login";
                }}
                className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Re-login Admin
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <PageTracker />
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/verify-pass/:regId" element={<VerifyPassPage />} />
            <Route path="/verify/:regId" element={<VerifyPassPage />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="magazine" element={<MagazinePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:slug" element={<EventDetailPage />} />
              <Route path="events/:slug/register" element={<EventRegistrationWizardPage />} />
              <Route path="events/:slug/registration-success" element={<RegistrationSuccessPage />} />
              <Route path="events/registration-success" element={<RegistrationSuccessPage />} />
              <Route path="partner" element={<PartnerWithUsPage />} />
              <Route path="events/partner" element={<PartnerWithUsPage />} />
              <Route path="membership" element={<DelegateRegistrationPage />} />
              <Route path="delegate-registration" element={<DelegateRegistrationPage />} />
              <Route path="events/register" element={<EventRegistrationWizardPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}


