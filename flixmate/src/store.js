import { createElement } from 'react'
// Imports createElement — the low-level React function that JSX compiles to; used here to avoid JSX in a .js file

import { AuthProvider, useAuth } from './context/AuthProvider'
// Imports the authentication context provider and its consumer hook from the auth context file

import { MovieProvider, useMovies } from './context/MovieContext'
// Imports the movie data context provider and its consumer hook from the movie context file

export function AppStoreProvider({ children }) {
  // A combined provider component that nests both context providers in one place
  // 'children' refers to whatever components are wrapped inside <AppStoreProvider>

  return createElement(
    // Manually calls createElement instead of JSX since this is a .js file (not .jsx)

    AuthProvider,
    // The outer provider — sets up the admin authentication context for the whole tree

    null,
    // The props argument for AuthProvider; null means no additional props are passed

    createElement(MovieProvider, null, children)
    // The inner provider — wraps children with movie data context; AuthProvider wraps MovieProvider so auth is accessible inside movie logic
  )
}

export { useAuth, useMovies }
// Re-exports both hooks so any component can import them from 'store' instead of digging into individual context files
