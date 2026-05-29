import { defineConfig } from 'vite'
// Imports the defineConfig helper from Vite — gives us autocomplete and type safety in the config object

import react from '@vitejs/plugin-react'
// Imports the official Vite plugin for React — handles JSX transform, Fast Refresh (hot reload), and React 19 support

// https://vite.dev/config/
export default defineConfig({
  // Exports the Vite config object; defineConfig wraps it for IDE type-checking support
  plugins: [react()],
  // Registers the React plugin so Vite knows how to compile .jsx files and enable hot reload
})
