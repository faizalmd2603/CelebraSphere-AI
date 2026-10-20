import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContent from './App';
import { EventProvider } from './context/EventContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <EventProvider>
        <AppContent />
      </EventProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
