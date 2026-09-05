import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { SocketProvider } from './hooks/useSocket';
import { ToastProvider } from './components/Toast';
import './index.css';

// Register MSW in development
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);