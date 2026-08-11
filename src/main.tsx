import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initMockFetch } from './backend/mockFetch';

// Temporary Mock Interceptor for Vercel Demo (bypasses Serverless cold-starts)
initMockFetch();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
