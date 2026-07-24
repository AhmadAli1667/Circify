import { useHover } from '../app/ui'

/**
 * Small presentational pieces shared across screens.
 * Non-component helpers (useHover, pill, shared constants) live in app/ui.js.
 */

/** The Flixmate reel-and-F mark. */
export function Logo({ size = 36 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ flex: 'none' }}>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="#141418" />
      <rect x="9.5" y="11" width="8.6" height="26" rx="2.2" fill="#c62b25" />
      {[13.6, 17.3, 21, 24.7, 28.4, 32.1].map((y) => (
        <rect key={y} x="11.3" y={y} width="2" height="2" rx=".6" fill="#141418" />
      ))}
      <path
        d="M20.5 15 L20.5 33 L24.5 33 L24.5 25.6 L32 25.6 L32 22.1 L24.5 22.1 L24.5 18.5 L35.5 18.5 L35.5 15 Z"
        fill="#e0322b"
      />
      <path d="M28 20.4 L37.5 26 L28 31.6 Z" fill="#ff5b52" />
    </svg>
  )
}

/** The chat assistant's face. */
export function Mascot({ size = 46 }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block', filter: 'drop-shadow(0 6px 16px var(--fm-accentglow))' }}
    >
      <rect x="6" y="8" width="52" height="48" rx="16" fill="var(--fm-accent)" />
      <rect x="3" y="20" width="5" height="6" rx="2" fill="var(--fm-accent)" />
      <rect x="3" y="34" width="5" height="6" rx="2" fill="var(--fm-accent)" />
      <rect x="56" y="20" width="5" height="6" rx="2" fill="var(--fm-accent)" />
      <rect x="56" y="34" width="5" height="6" rx="2" fill="var(--fm-accent)" />
      <circle cx="24" cy="30" r="8" fill="#fff" />
      <circle cx="40" cy="30" r="8" fill="#fff" />
      <circle cx="25" cy="31" r="3.6" fill="#1a1113" />
      <circle cx="41" cy="31" r="3.6" fill="#1a1113" />
      <path d="M25 43 Q32 49 39 43" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ size = 17, stroke = 2.3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function BackIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

/** Circular back button used on For You, Friends and elsewhere. */
export function BackButton({ onClick, style }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label="Go back"
      style={{
        width: 38,
        height: 38,
        display: 'grid',
        placeItems: 'center',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: '50%',
        color: hov ? 'var(--fm-accent)' : 'var(--fm-text)',
        cursor: 'pointer',
        transition: 'all .2s',
        ...style
      }}
    >
      <BackIcon />
    </button>
  )
}

/** Bottom-centre notice for features the prototype can't back with real data. */
export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 30,
        transform: 'translateX(-50%)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 20px',
        borderRadius: 14,
        background: 'var(--fm-elev)',
        border: '1px solid var(--fm-accent)',
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13.5,
        boxShadow: '0 18px 46px rgba(0,0,0,.45)',
        animation: 'fmPop .25s ease'
      }}
    >
      <span style={{ color: 'var(--fm-accent)', fontSize: 15 }}>✦</span>
      {message}
    </div>
  )
}

/** Inline "coming soon" pill for controls that sit inside a layout. */
export function SoonTag({ style }) {
  return (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: 6,
        background: 'var(--fm-accentsoft)',
        color: 'var(--fm-accent)',
        fontWeight: 900,
        fontSize: 9.5,
        letterSpacing: '.6px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      Soon
    </span>
  )
}
