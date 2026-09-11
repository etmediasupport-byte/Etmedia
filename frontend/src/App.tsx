import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/site/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import MagazinePage from "@/pages/MagazinePage";
import EventsPage from "@/pages/EventsPage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="magazine" element={<MagazinePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/*" element={<EventsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
