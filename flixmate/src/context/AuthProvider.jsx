import { createContext, useContext, useEffect, useMemo, useState } from 'react'
// Imports React hooks and context tools:
// createContext — creates a shared data container
// useContext — reads from that container inside any component
// useEffect — runs side-effects (like checking localStorage) after render
// useMemo — memoizes a value so it only recalculates when dependencies change
// useState — local component state

const AuthContext = createContext(null)
// Creates the authentication context; null is the default value before the Provider wraps the tree

const ADMIN_USER = 'AhmadAdmin'
// Hardcoded admin username — stored as a constant so it's easy to change in one place

const ADMIN_PASS = 'Flixmate2026_Secure'
// Hardcoded admin password — WARNING: this is visible in source code and browser DevTools

const AUTH_KEY = 'flixmate_admin_auth'
// The localStorage key used to persist admin login state across page refreshes

export function AuthProvider({ children }) {
  // The context provider component — wraps the app and gives all children access to auth state

  const [isAdmin, setIsAdmin] = useState(false)
  // isAdmin: boolean tracking whether the admin is currently logged in; starts as false

  useEffect(() => {
    // Runs once on mount to restore admin session from localStorage

    const saved = localStorage.getItem(AUTH_KEY)
    // Reads the saved auth value from localStorage; returns null if key doesn't exist

    setIsAdmin(saved === 'true')
    // Sets isAdmin to true only if the saved string is exactly 'true'; guards against other values
  }, [])
  // Empty dependency array means this runs only once, when the component first mounts

  const loginAdmin = (username, password) => {
    // Function called when admin submits the login form; receives username and password strings

    const ok = username === ADMIN_USER && password === ADMIN_PASS
    // Checks if both username AND password match the hardcoded credentials; returns boolean

    if (ok) {
      // Only update state if credentials are correct

      setIsAdmin(true)
      // Marks the user as admin in React state — triggers a re-render

      localStorage.setItem(AUTH_KEY, 'true')
      // Persists the login to localStorage so the user stays logged in after refresh
    }
    return ok
    // Returns true on success, false on failure — lets the calling component show an error message
  }

  const logoutAdmin = () => {
    // Function called when the admin clicks the Logout button

    setIsAdmin(false)
    // Clears admin status from React state — triggers re-render back to login screen

    localStorage.setItem(AUTH_KEY, 'false')
    // Updates localStorage so the session stays cleared after a page refresh
  }

  const value = useMemo(
    // useMemo creates the context value object; only recreates it when isAdmin changes

    () => ({
      // The object that all consumers of this context will receive

      isAdmin,
      // Boolean — whether the current user is logged in as admin

      loginAdmin,
      // Function — call with (username, password) to attempt admin login

      logoutAdmin,
      // Function — call to log out the admin

      adminCredentialsHint: { username: ADMIN_USER, password: ADMIN_PASS }
      // Debug helper object exposing the hardcoded credentials — used for testing/display in the UI
    }),
    [isAdmin]
    // Re-runs only when isAdmin changes; loginAdmin and logoutAdmin are stable (no deps)
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  // Renders the Context Provider wrapping all child components; value is the auth object above
}

export function useAuth() {
  // Custom hook — any component imports and calls this to access auth state and functions

  const ctx = useContext(AuthContext)
  // Reads the current value from AuthContext; returns null if used outside the provider

  if (!ctx) {
    // Safety check — if this is null it means the hook was called outside AuthProvider

    throw new Error('useAuth must be used within AuthProvider')
    // Throws a descriptive error to help developers catch misuse during development
  }
  return ctx
  // Returns the auth object: { isAdmin, loginAdmin, logoutAdmin, adminCredentialsHint }
}
