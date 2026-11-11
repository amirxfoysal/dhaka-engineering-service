import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from './admin/auth/AdminAuthContext';
import { AppProvider } from './context/AppContext';
import { BannersProvider } from './context/BannersContext';
import { ClientsProvider } from './context/ClientsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { OffersProvider } from './context/OffersContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ServicesProvider } from './context/ServicesContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { AppBootGate } from './components/AppBootGate';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <SettingsProvider>
            <AppBootGate>
              <ServicesProvider>
                <BannersProvider>
                  <OffersProvider>
                    <ClientsProvider>
                      <ReviewsProvider>
                        <NotificationsProvider>
                          <AppProvider>
                            <App />
                          </AppProvider>
                        </NotificationsProvider>
                      </ReviewsProvider>
                    </ClientsProvider>
                  </OffersProvider>
                </BannersProvider>
              </ServicesProvider>
            </AppBootGate>
          </SettingsProvider>
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
