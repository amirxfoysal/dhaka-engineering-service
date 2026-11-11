import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { HelplineSection } from './components/HelplineSection';
import { SiteFooter } from './components/SiteFooter';
import { SocialMediaSection } from './components/SocialMediaSection';
import { TopNav } from './components/TopNav';
import { HomePage } from './pages/HomePage';
import { Seo } from './seo/Seo';

const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })),
);
const ServiceDetailsPage = lazy(() =>
  import('./pages/ServiceDetailsPage').then((m) => ({ default: m.ServiceDetailsPage })),
);
const ClientsPage = lazy(() =>
  import('./pages/ClientsPage').then((m) => ({ default: m.ClientsPage })),
);
const BookingPage = lazy(() =>
  import('./pages/BookingPage').then((m) => ({ default: m.BookingPage })),
);
const BookingsPage = lazy(() =>
  import('./pages/BookingsPage').then((m) => ({ default: m.BookingsPage })),
);
const TrackingPage = lazy(() =>
  import('./pages/TrackingPage').then((m) => ({ default: m.TrackingPage })),
);

const AdminApp = lazy(() =>
  import('./admin/AdminApp').then((module) => ({ default: module.AdminApp })),
);

function RouteFallback() {
  return <div className="route-fallback" aria-hidden="true" />;
}

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
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
        <HelplineSection />
        <SocialMediaSection />
        <SiteFooter />
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
