import { useState } from 'react'

/**
 * Non-component UI helpers and shared constants.
 *
 * These live apart from the .jsx files so every component module exports only
 * components, which is what keeps Fast Refresh working during `npm run dev`.
 */

/** Hover state helper — returns [isHovered, propsToSpread]. */
export function useHover() {
  const [on, setOn] = useState(false)
  return [on, { onMouseEnter: () => setOn(true), onMouseLeave: () => setOn(false) }]
}

/** Active/inactive chip colours used by every filter control. */
export function pill(active) {
  return active
    ? { background: 'var(--fm-accent)', color: '#fff', borderColor: 'var(--fm-accent)' }
    : { background: 'transparent', color: 'var(--fm-text)', borderColor: 'var(--fm-border)' }
}

/** The poster grid shared by Search, Watchlist and the Home results view. */
export const RESULT_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(168px,1fr))',
  gap: 20
}

/** Mood chip → genre, using genres the real catalogue actually contains. */
export const MOOD_MAP = {
  Cozy: 'Comedy',
  Tense: 'Thriller',
  Heartfelt: 'Drama',
  Adrenaline: 'Action',
  Eerie: 'Horror',
  Dreamy: 'Sci-Fi'
}

/** Starter prompts offered by both the chat widget and the full chat screen. */
export const CHAT_CHIPS = ['Rainy-night slow burn', 'Feel-good comedy', 'Mind-bending sci-fi']

/** Human labels for the decade filter keys. */
export const DECADE_LABEL = { 2020: "'20s", 2010: "'10s", 2000: "'00s", class: 'Classics' }
