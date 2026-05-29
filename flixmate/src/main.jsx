import { StrictMode } from 'react'
// Imports StrictMode from React — a dev-only wrapper that detects common mistakes and deprecated patterns

import { createRoot } from 'react-dom/client'
// Imports createRoot — the React 18+ API for mounting the app into the DOM (replaces old ReactDOM.render)

import './index.css'
// Imports the global CSS file — loads Tailwind base styles, Google Fonts, and custom scrollbar rules

import App from './App.jsx'
// Imports the root App component — the top-level component that controls routing and layout

import { AppStoreProvider } from './store'
// Imports the combined context provider — wraps the entire app so all components can access auth and movie state

createRoot(document.getElementById('root')).render(
  // Creates a React root attached to the <div id="root"> in index.html and starts rendering

  <StrictMode>
    {/* StrictMode wraps everything — in development it intentionally double-renders to catch side-effects */}
    <AppStoreProvider>
      {/* AppStoreProvider wraps with AuthProvider and MovieProvider, making all state available everywhere */}
      <App />
      {/* The actual app — all pages, routing logic, and modals live inside here */}
    </AppStoreProvider>
  </StrictMode>,
  // Closing argument of .render() — React takes this JSX tree and inserts it into the DOM
)
