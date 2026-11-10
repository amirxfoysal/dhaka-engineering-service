import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from './admin/auth/AdminAuthContext';
import { AppProvider } from './context/AppContext';
import { BannersProvider } from './context/BannersContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { OffersProvider } from './context/OffersContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ServicesProvider } from './context/ServicesContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <ServicesProvider>
              <BannersProvider>
                <OffersProvider>
                  <ReviewsProvider>
                    <NotificationsProvider>
                      <AppProvider>
                        <App />
                      </AppProvider>
                    </NotificationsProvider>
                  </ReviewsProvider>
                </OffersProvider>
              </BannersProvider>
            </ServicesProvider>
          </SettingsProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
