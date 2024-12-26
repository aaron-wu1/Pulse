import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/theme-provider';
import { PollingProvider } from './components/polling-provider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <PollingProvider defaultPolling={true}>
        <App />
      </PollingProvider>
    </ThemeProvider>
  </React.StrictMode>
);
