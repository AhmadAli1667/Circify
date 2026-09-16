import { useStore } from '../app/storeContext'
import { MOOD_MAP, useIsMobile } from '../app/ui'
import { SearchIcon } from './primitives'
import SearchDropdown from './SearchDropdown'

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
 * The "In the mood" discovery wizard. Desktop: a collapsed 60px rail on the
 * left of Home that expands into a side drawer on hover, click, or pin.
 * Mobile: hover doesn't exist on touch, so it's a small round trigger button
 * that opens a bottom sheet instead, tap-only, with a backdrop to close.
 */
export default function WizardRail() {
  const { state, patch, resetFilters, filtersActive, genres } = useStore()
  const isMobile = useIsMobile()
  const open = isMobile ? state.wizardPin : state.wizardHover || state.wizardPin
  const close = () => patch({ wizardPin: false, wizardHover: false })

  const panel = (
    <>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--fm-muted)', fontWeight: 600 }}>
        Search or tune the mood, results appear right on your home screen.
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
      <div style={{ marginBottom: 22 }}>
        <SearchDropdown
          options={[
            { value: null, label: 'Any mood' },
            ...Object.keys(MOOD_MAP).map((label) => ({ value: label, label }))
          ]}
          value={state.mood}
          onChange={(v) => patch(v ? { mood: v, genre: MOOD_MAP[v] } : { mood: null })}
          placeholder="Search moods…"
        />
      </div>

      <GroupTitle>Genre</GroupTitle>
      <div style={{ marginBottom: 22 }}>
        <SearchDropdown
          options={['all', ...genres].map((g) => ({ value: g, label: g === 'all' ? 'All' : g }))}
          value={state.genre}
          onChange={(g) => patch({ genre: g, mood: null })}
          placeholder="Search genres…"
        />
      </div>

      <GroupTitle>Only show me</GroupTitle>
      <div style={{ marginBottom: 22 }}>
        <SearchDropdown
          options={RATING_TIERS.map((r) => ({ value: r.k, label: r.l }))}
          value={state.minRating}
          onChange={(k) => patch({ minRating: k })}
          placeholder="Search ratings…"
        />
      </div>

      <GroupTitle>Era</GroupTitle>
      <div style={{ marginBottom: 24 }}>
        <SearchDropdown
          options={DECADES.map((d) => ({ value: d.k, label: d.l }))}
          value={state.decade}
          onChange={(k) => patch({ decade: k })}
          placeholder="Search eras…"
        />
      </div>

      <button
        onClick={close}
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
        Show results
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
    </>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => patch((s) => ({ wizardPin: !s.wizardPin }))}
          aria-label="In the mood, find your next film"
          style={{
            position: 'fixed',
            left: 16,
            bottom: 16,
            zIndex: 30,
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--fm-accent)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 30px var(--fm-accentglow)'
          }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
            <path d="M4 6h16M8 12h8M11 18h2" />
          </svg>
          {filtersActive && (
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#fff'
              }}
            />
          )}
        </button>

        {open && (
          <>
            <div
              onClick={close}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 39 }}
            />
            <div
              className="fm-scroll"
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: '85vh',
                background: 'var(--fm-surface)',
                borderRadius: '22px 22px 0 0',
                padding: '14px 20px 26px',
                overflowY: 'auto',
                boxShadow: '0 -20px 60px rgba(0,0,0,.4)',
                zIndex: 40,
                animation: 'fmPop .22s ease'
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--fm-border)', margin: '0 auto 16px' }} />
              <div className="fm-disp" style={{ fontSize: 24, lineHeight: 1.05, marginBottom: 6 }}>
                Find your next film
              </div>
              {panel}
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <aside
      onMouseEnter={() => patch({ wizardHover: true })}
      onMouseLeave={() => patch({ wizardHover: false })}
      style={{ position: 'fixed', left: 0, top: 'var(--fm-navbar-h, 70px)', bottom: 0, width: 60, zIndex: 30 }}
    >
      <div
        onClick={() => patch((s) => ({ wizardPin: !s.wizardPin }))}
        style={{
          height: '100%',
          background: 'var(--fm-surface)',
          borderRight: '1px solid var(--fm-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 22,
          gap: 16,
          cursor: 'pointer'
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
          {panel}
        </div>
      )}
    </aside>
  )
}

function GroupTitle({ children }) {
  return <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 11 }}>{children}</div>
}
