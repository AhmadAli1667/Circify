import { createContext, useContext } from 'react'

/**
 * The store context and its accessor, kept apart from the provider component
 * so `store.jsx` exports nothing but a component.
 */
export const StoreContext = createContext(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
