import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { useThemeStore } from '@/store/themeStore';

// Apply the persisted theme class before React mounts to avoid a
// flash-of-wrong-theme on load.
document.documentElement.classList.add(useThemeStore.getState().theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
