import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ChannelPage } from './pages/ChannelPage';
import { AboutPage } from './pages/AboutPage';
import { OurCodePage } from './pages/OurCodePage';
import { BookABrainPage } from './pages/BookABrainPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CommunityPage } from './pages/CommunityPage';
import { EventsPage } from './pages/EventsPage';
import { BootcampsPage } from './pages/BootcampsPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/channel" element={<ChannelPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/our-code" element={<OurCodePage />} />
            <Route path="/book-a-brain" element={<BookABrainPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/bootcamps" element={<BootcampsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SiteProvider>
    </BrowserRouter>
  );
}
