import { useEffect, useState } from 'react'

/**
 * Non-component UI helpers and shared constants.
 *
 * These live apart from the .jsx files so every component module exports only
 * components, which is what keeps Fast Refresh working during `npm run dev`.
 */

/** Hover state helper. Returns [isHovered, propsToSpread]. */
export function useHover() {
  const [on, setOn] = useState(false)
  return [on, { onMouseEnter: () => setOn(true), onMouseLeave: () => setOn(false) }]
}

/** The one breakpoint the app designs around: below this, layouts switch to a mobile pattern. */
export const MOBILE_BREAKPOINT = 720

/** True below MOBILE_BREAKPOINT, live-updates on resize/orientation change. */
export function useIsMobile() {
  const query = `(max-width: ${MOBILE_BREAKPOINT}px)`
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return isMobile
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

/** Cycled while waiting on a reply, the model can take a while to finish its tool calls. */
export const CHAT_WAIT_PHRASES = [
  'Thinking…',
  'Checking your taste…',
  'Searching movies…',
  'Weighing a few options…',
  'Almost there…'
]

/** Cycled by full-page loaders (boot screen, actor/cast-crew pages) so a slow fetch reads as progress, not a stall. */
export const LOADING_PHRASES = ['Loading…', 'Picking…', 'Formulating…', 'Dimming the lights…', 'Cueing the reel…']

/** Rotates through `phrases` every `intervalMs`, looping back to the start. */
export function useCyclingPhrase(phrases, intervalMs = 2200) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % phrases.length), intervalMs)
    return () => clearInterval(t)
  }, [phrases, intervalMs])
  return phrases[index]
}

/** Human labels for the decade filter keys. */
export const DECADE_LABEL = { 2020: "'20s", 2010: "'10s", 2000: "'00s", class: 'Classics' }

/**
 * Illustrative community reviews for the movie modal's Reviews tab. Sample
 * content, honestly labeled where it appears. For You no longer draws on it,
 * that panel reads TMDb's real reviews (see useMovieReviews.js).
 */
/** 546 → "546", 9340 → "9.3K", 196000 → "196K", 2400000 → "2.4M". */
export function compactCount(n) {
  const value = Number(n) || 0
  if (value < 1000) return String(value)
  const [scaled, suffix] = value < 1e6 ? [value / 1e3, 'K'] : [value / 1e6, 'M']
  return `${scaled < 10 ? scaled.toFixed(1).replace(/\.0$/, '') : Math.round(scaled)}${suffix}`
}

const AGO_UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60]
]

/** ISO timestamp → "1 year ago", the relative stamp a comment feed reads with. */
export function timeAgo(iso) {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''
  const seconds = Math.max(1, (Date.now() - then) / 1000)
  for (const [unit, size] of AGO_UNITS) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size)
      return `${n} ${unit}${n > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}
