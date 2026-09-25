import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMockFetch } from './backend/mockFetch';

// Client-side mock interceptor is disabled by default so the application connects directly to the PostgreSQL database backend.
if ((import.meta as any).env?.VITE_USE_MOCK === 'true') {
  console.log("Running in offline mock mode");
  initMockFetch();
} else {
  console.log("Connected to PostgreSQL backend API");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
