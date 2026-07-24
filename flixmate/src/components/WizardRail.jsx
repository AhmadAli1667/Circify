import { useStore } from '../app/storeContext'
import { MOOD_MAP, pill } from '../app/ui'
import { SearchIcon } from './primitives'

const DECADES = [
  { k: 'all', l: 'Any era' },
  { k: '2020', l: "'20s" },
  { k: '2010', l: "'10s" },
  { k: '2000', l: "'00s" },
  { k: 'class', l: 'Classics' }
]

const RATING_TIERS = [
  { k: 0, l: 'Any' },
  { k: 7, l: '7+' },
  { k: 8, l: '8+' },
  { k: 9, l: '9+' }
]

/**
 * The collapsed 60px rail on the left of Home that expands into the
 * "In the mood" discovery wizard on hover (or stays open when pinned).
 */
export default function WizardRail() {
  const { state, patch, resetFilters, filtersActive, results, genres } = useStore()
  const open = state.wizardHover || state.wizardPin

  return (
    <aside
      onMouseEnter={() => patch({ wizardHover: true })}
      onMouseLeave={() => patch({ wizardHover: false })}
      style={{ position: 'fixed', left: 0, top: 69, bottom: 0, width: 60, zIndex: 30 }}
    >
      <div
        style={{
          height: '100%',
          background: 'var(--fm-surface)',
          borderRight: '1px solid var(--fm-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 22,
          gap: 16
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--fm-accentsoft)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--fm-accent)'
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="M4 6h16M8 12h8M11 18h2" />
          </svg>
        </div>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '1.5px',
            color: 'var(--fm-muted)',
            textTransform: 'uppercase'
          }}
        >
          In the mood
        </div>
        {filtersActive && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fm-accent)' }} />
        )}
      </div>

      {open && (
        <div
          className="fm-scroll"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 308,
            background: 'var(--fm-surface)',
            borderRight: '1px solid var(--fm-border)',
            padding: '26px 24px',
            overflowY: 'auto',
            boxShadow: '24px 0 60px rgba(0,0,0,.35)',
            animation: 'fmSlide .28s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="fm-disp" style={{ fontSize: 26, lineHeight: 1.05 }}>
              Find your
              <br />
              next film
            </div>
            <button
              onClick={() => patch((s) => ({ wizardPin: !s.wizardPin }))}
              title="Keep open"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                border: '1px solid var(--fm-border)',
                background: state.wizardPin ? 'var(--fm-accent)' : 'transparent',
                color: state.wizardPin ? '#fff' : 'var(--fm-muted)',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              ⇥
            </button>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--fm-muted)', fontWeight: 600 }}>
            Search or tune the mood — results appear right on your home screen.
          </p>

          <div style={{ position: 'relative', marginBottom: 22 }}>
            <div
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--fm-muted)',
                display: 'flex',
                pointerEvents: 'none'
              }}
            >
              <SearchIcon size={16} />
            </div>
            <input
              value={state.query}
              onChange={(e) => patch({ query: e.target.value, mood: null })}
              placeholder="Search genres, moods, years, titles…"
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                border: '1px solid var(--fm-border)',
                background: 'var(--fm-input)',
                borderRadius: 12,
                color: 'var(--fm-text)',
                fontSize: 13.5,
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <GroupTitle>How should it feel?</GroupTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 26 }}>
            {Object.keys(MOOD_MAP).map((label) => (
              <RailChip
                key={label}
                round
                active={state.mood === label}
                onClick={() => patch({ mood: label, genre: MOOD_MAP[label] })}
              >
                {label}
              </RailChip>
            ))}
          </div>

          <GroupTitle>Genre</GroupTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 26 }}>
            {['all', ...genres].map((g) => (
              <RailChip key={g} active={state.genre === g} onClick={() => patch({ genre: g, mood: null })}>
                {g === 'all' ? 'All' : g}
              </RailChip>
            ))}
          </div>

          <GroupTitle>Only show me</GroupTitle>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {RATING_TIERS.map((r) => (
              <RailChip key={r.k} grow active={state.minRating === r.k} onClick={() => patch({ minRating: r.k })}>
                {r.l}
              </RailChip>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {DECADES.map((d) => (
              <RailChip key={d.k} active={state.decade === d.k} onClick={() => patch({ decade: d.k })}>
                {d.l}
              </RailChip>
            ))}
          </div>

          <button
            onClick={() => patch({ wizardPin: false, wizardHover: false })}
            style={{
              width: '100%',
              padding: 12,
              border: 'none',
              borderRadius: 12,
              background: 'var(--fm-accent)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: 9,
              boxShadow: '0 5px 18px var(--fm-accentglow)'
            }}
          >
            Show {results.length} results
          </button>
          <button
            onClick={resetFilters}
            className="fm-accent-hover"
            style={{
              width: '100%',
              padding: 11,
              border: '1px solid var(--fm-border)',
              background: 'transparent',
              color: 'var(--fm-muted)',
              fontWeight: 800,
              fontSize: 13,
              borderRadius: 12,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      )}
    </aside>
  )
}

function GroupTitle({ children }) {
  return <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 11 }}>{children}</div>
}

function RailChip({ children, active, onClick, grow, round }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: grow ? 1 : 'none',
        padding: round ? '8px 13px' : grow ? '9px 0' : '7px 12px',
        borderRadius: round ? 20 : 9,
        border: '1px solid',
        ...pill(active),
        fontWeight: grow ? 800 : 700,
        fontSize: round ? 13 : 12.5,
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      {children}
    </button>
  )
}
