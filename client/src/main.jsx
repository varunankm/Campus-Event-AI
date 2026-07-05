import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 46, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#050510' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#050510' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
