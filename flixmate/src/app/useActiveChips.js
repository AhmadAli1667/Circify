import { useStore } from './storeContext'
import { DECADE_LABEL } from './ui'

/** Builds the removable filter chips shown above every result grid. */
export function useActiveChips() {
  const { state, patch } = useStore()
  const chips = []

  if (state.query) chips.push({ label: `"${state.query}"`, clear: () => patch({ query: '' }) })
  if (state.mood) chips.push({ label: state.mood, clear: () => patch({ mood: null, genre: 'all' }) })
  if (state.genre !== 'all' && !state.mood)
    chips.push({ label: state.genre, clear: () => patch({ genre: 'all' }) })
  if (state.type !== 'all')
    chips.push({
      label: state.type === 'series' ? 'Series' : 'Films',
      clear: () => patch({ type: 'all' })
    })
  if (state.minRating > 0)
    chips.push({ label: `${state.minRating}+ rating`, clear: () => patch({ minRating: 0 }) })
  if (state.decade !== 'all')
    chips.push({ label: DECADE_LABEL[state.decade], clear: () => patch({ decade: 'all' }) })

  return chips
}
