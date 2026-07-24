import { useStore } from '../app/storeContext'
import PosterCard from '../components/PosterCard'
import ActiveChips, { NoResults } from '../components/ActiveChips'
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
        <div style={RESULT_GRID}>
          {results.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <NoResults withIcon hint="Loosen a filter or try another search." />
      )}
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
