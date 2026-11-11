import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { HelplineSection } from './components/HelplineSection';
import { SiteFooter } from './components/SiteFooter';
import { SocialMediaSection } from './components/SocialMediaSection';
import { TopNav } from './components/TopNav';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { ClientsPage } from './pages/ClientsPage';
import { BookingPage } from './pages/BookingPage';
import { BookingsPage } from './pages/BookingsPage';
import { TrackingPage } from './pages/TrackingPage';
import { Seo } from './seo/Seo';

const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((module) => ({ default: module.AdminApp })),
);

function shouldHideBottomNav(pathname: string) {
  if (pathname === '/book') return true;
  if (pathname.startsWith('/services/') && pathname !== '/services') return true;
  return false;
}

export default function App() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin')) {
    return (
      <>
        <Seo />
        <Suspense fallback={<div className="admin-boot">Loading admin…</div>}>
          <AdminApp />
        </Suspense>
      </>
    );
  }

  const hideBottomNav = shouldHideBottomNav(pathname);

  return (
    <div className={`app-shell${hideBottomNav ? ' app-shell--no-bottom-nav' : ''}`}>
      <Seo />
      <TopNav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:categoryId" element={<ServiceDetailsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/profile" element={<Navigate to="/tracking" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <HelplineSection />
        <SocialMediaSection />
        <SiteFooter />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
