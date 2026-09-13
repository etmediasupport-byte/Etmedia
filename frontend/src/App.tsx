import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
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

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="magazine" element={<MagazinePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:slug" element={<EventDetailPage />} />
          <Route path="partner" element={<PartnerWithUsPage />} />
          <Route path="events/partner" element={<PartnerWithUsPage />} />
          <Route path="delegate-registration" element={<DelegateRegistrationPage />} />
          <Route path="events/register" element={<DelegateRegistrationPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </HelmetProvider>
);
}


