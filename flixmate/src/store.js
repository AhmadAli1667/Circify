import { createElement } from 'react'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { MovieProvider, useMovies } from './context/MovieContext'

export function AppStoreProvider({ children }) {
  return createElement(
    AuthProvider,
    null,
    createElement(MovieProvider, null, children)
  )
}

export { useAuth, useMovies }
