import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA installability (skip in AI Studio Dev / localhost to avoid state/cache corruption)
const isDev = 
  typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || 
   window.location.hostname === "127.0.0.1" || 
   window.location.hostname.includes("ais-dev") ||
   window.location.hostname.includes("run.app"));

if ('serviceWorker' in navigator) {
  if (isDev) {
    // Automatically unregister any active service worker in development to prevent stale caches and API failures
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log("[Dev Mode] Unregistered stale service worker successfully.");
            // Reload the page once to clear service worker interceptors
            window.location.reload();
          }
        });
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('GateKaru Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('GateKaru Service Worker registration failed:', error);
        });
    });
  }
}
