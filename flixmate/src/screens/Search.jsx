import { useMemo } from 'react'
import { useStore } from '../app/storeContext'
import PosterCard from '../components/PosterCard'
import RowScroller from '../components/RowScroller'
import ActiveChips from '../components/ActiveChips'
import { useActiveChips } from '../app/useActiveChips'
import { RESULT_GRID, useHover } from '../app/ui'

/** Full-page result grid, reached from the navbar search field. */
export default function Search() {
  const { state, patch, results, resetFilters } = useStore()
  const chips = useActiveChips()

  const heading = state.mood
    ? `${state.mood} mood`
    : state.query
      ? `"${state.query}"`
      : state.genre !== 'all'
        ? state.genre
        : 'All titles'

  return (
    <div style={{ padding: '28px 40px 64px', maxWidth: 1500, margin: '0 auto', animation: 'fmFade .35s ease' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: 'var(--fm-muted)', fontWeight: 700, marginBottom: 4 }}>
            {results.length} titles
          </div>
          <h1 className="fm-disp" style={{ margin: 0, fontSize: 38, lineHeight: 1 }}>
            {heading}
          </h1>
        </div>
        <FilterButton onClick={() => patch((s) => ({ filterOpen: !s.filterOpen, menuOpen: false }))} />
      </div>

      <ActiveChips chips={chips} showLabel onClearAll={resetFilters} />

      {results.length ? (
        <div key="results" style={{ ...RESULT_GRID, animation: 'fmFade .3s ease' }}>
          {results.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <SearchSuggestions />
      )}
    </div>
  )
}

/**
 * Shown instead of a bare "no results" dead end, either while the live
 * search request is still in flight or once it's back with nothing. Either
 * way there's always something to look at and tap into, not a stop sign.
 */
function SearchSuggestions() {
  const { state, resetFilters } = useStore()
  const picks = useMemo(
    () => [...state.movies].sort((a, b) => b.popularity - a.popularity).slice(0, 16),
    [state.movies]
  )

  return (
    <div style={{ animation: 'fmFade .35s ease', paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        {state.searching ? (
          <>
            <TypingDots />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fm-muted)' }}>Searching…</span>
          </>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fm-muted)' }}>
            No exact matches yet. Here's what's popular right now:
          </span>
        )}
      </div>
      <div style={{ marginBottom: 22 }}>
        <button
          onClick={resetFilters}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--fm-accent)',
            fontWeight: 800,
            fontSize: 12.5,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline'
          }}
        >
          Clear search
        </button>
      </div>

      <RowScroller>
        {picks.map((m) => (
          <div key={m.id} style={{ flex: 'none', width: 174, scrollSnapAlign: 'start' }}>
            <PosterCard movie={m} />
          </div>
        ))}
      </RowScroller>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--fm-accent)',
            animation: `fmDots 1.2s ${delay}s infinite`
          }}
        />
      ))}
    </div>
  )
}

function FilterButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 16px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 12,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13.5,
        cursor: 'pointer'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M6 4v16M12 4v16M18 4v16" />
        <circle cx="6" cy="9" r="2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" />
        <circle cx="18" cy="7" r="2" fill="currentColor" stroke="none" />
      </svg>
      Filter &amp; sort
    </button>
  )
}
