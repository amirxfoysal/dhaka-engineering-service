import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminTechniciansProvider } from './context/AdminTechniciansContext';
import { RequireAdminAuth } from './components/RequireAdminAuth';
import { AdminLayout } from './AdminLayout';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminCustomersPage } from './pages/AdminCustomersPage';
import { AdminTechniciansPage } from './pages/AdminTechniciansPage';
import { AdminServicesPage } from './pages/AdminServicesPage';
import { AdminBannersPage } from './pages/AdminBannersPage';
import { AdminOffersPage } from './pages/AdminOffersPage';
import { AdminReviewsPage } from './pages/AdminReviewsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import './pages/AdminDashboard.css';

export function AdminApp() {
  return (
    <AdminTechniciansProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="technicians" element={<AdminTechniciansPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="offers" element={<AdminOffersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminTechniciansProvider>
  );
}
