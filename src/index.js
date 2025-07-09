import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <Toaster
        position="top-center" // ✅ CENTRADA
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#111827',
            padding: '20px 24px',
            borderRadius: '16px',
            fontSize: '18px',
            fontWeight: '600',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)'
          },
          success: {
            icon: '🎉'
          },
          error: {
            style: {
              background: '#ffe4e6',
              color: '#b91c1c'
            },
            icon: '🚫'
          }
        }}
      />
      <App />
    </>
  </React.StrictMode>
);

reportWebVitals();
