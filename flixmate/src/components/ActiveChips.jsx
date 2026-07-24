import { useStore } from '../app/storeContext'

/** Removable filter chips. Build the list with useActiveChips(). */
export default function ActiveChips({ chips, showLabel, onClearAll }) {
  if (!chips.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22, alignItems: 'center' }}>
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--fm-muted)',
            textTransform: 'uppercase',
            letterSpacing: '.6px'
          }}
        >
          Filters
        </span>
      )}
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={c.clear}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 8px 6px 13px',
            borderRadius: 20,
            border: '1px solid var(--fm-accent)',
            background: 'var(--fm-accentsoft)',
            color: 'var(--fm-accent)',
            fontWeight: 800,
            fontSize: 12.5,
            cursor: 'pointer'
          }}
        >
          {c.label}
          <span
            style={{
              width: 17,
              height: 17,
              borderRadius: '50%',
              background: 'var(--fm-accent)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 10
            }}
          >
            ✕
          </span>
        </button>
      ))}
      {onClearAll && (
        <button
          onClick={onClearAll}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--fm-muted)',
            fontWeight: 800,
            fontSize: 12.5,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Clear all
        </button>
      )}
    </div>
  )
}

/** Shared "no matches" panel. */
export function NoResults({ hint, withIcon }) {
  const { resetFilters } = useStore()
  return (
    <div style={{ textAlign: 'center', padding: '76px 20px' }}>
      {withIcon && (
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--fm-surface)',
            border: '1px solid var(--fm-border)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
            color: 'var(--fm-muted)'
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </div>
      )}
      <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Nothing matches those filters</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fm-muted)', marginBottom: 22 }}>{hint}</div>
      <button
        onClick={resetFilters}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: 12,
          background: 'var(--fm-accent)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer'
        }}
      >
        Clear filters
      </button>
    </div>
  )
}
