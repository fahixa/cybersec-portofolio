import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createDefaultAdminUser } from './utils/adminSetup.ts';

// Create default admin user on app startup
createDefaultAdminUser();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
