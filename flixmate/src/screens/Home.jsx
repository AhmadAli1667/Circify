import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from '../app/storeContext'
import { usePaginatedList } from '../app/usePaginatedList'
import { adaptMovie } from '../app/catalog'
import * as api from '../app/tmdbApi'
import PosterCard from '../components/PosterCard'
import RowScroller from '../components/RowScroller'
import WizardRail from '../components/WizardRail'
import Footer from '../components/Footer'
import ActiveChips, { NoResults } from '../components/ActiveChips'
import { Mascot } from '../components/primitives'
import { ChatComposer, SuggestionChip } from './Chat'
import { useActiveChips } from '../app/useActiveChips'
import { CHAT_CHIPS, RESULT_GRID, useHover, useIsMobile } from '../app/ui'

/**
 * Genre rows on Home, each backed by a real TMDb discover query so "See all"
 * can keep paging in more titles instead of hard-capping at a fixed list.
 * `withGenres` uses TMDb's with_genres syntax: comma = AND, so 'Comedy,Romance'
 * means "tagged both", a reasonable definition of rom-com.
 */
const GENRE_ROWS = [
  { key: 'action', title: 'Action', withGenres: '28' },
  { key: 'comedy', title: 'Comedy', withGenres: '35' },
  { key: 'horror', title: 'Horror', withGenres: '27' },
  { key: 'kids', title: 'Kids & Family', withGenres: '10751' },
  { key: 'romcom', title: 'Rom-Coms', withGenres: '35,10749' },
  { key: 'scifi', title: 'Sci-Fi', withGenres: '878' },
  { key: 'documentary', title: 'Documentaries', withGenres: '99' }
]

/**
 * Home. Shows the hero carousel plus the curated rows until any filter is
 * active, at which point the same page swaps to a result grid in place.
 */
export default function Home() {
  const { filtersActive } = useStore()
  const isMobile = useIsMobile()

  return (
    <div style={{ position: 'relative' }}>
      <AmbientIcons />
      <WizardRail />

      <div
        style={{
          padding: isMobile ? '18px 18px 0' : '26px 40px 0 100px',
          maxWidth: 1620,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}
      >
        {filtersActive ? <HomeResults /> : <HomeFeatured />}
        <Footer />
      </div>
    </div>
  )
}

/** Oversized outlined film icons drifting behind the page at ~5% opacity. */
function AmbientIcons() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        color: 'var(--fm-muted)'
      }}
    >
      <svg
        width="150"
        height="150"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ position: 'absolute', top: 120, left: 44, opacity: 0.05, transform: 'rotate(-12deg)' }}
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.2" />
        <circle cx="12" cy="6" r="1.3" />
        <circle cx="12" cy="18" r="1.3" />
        <circle cx="6" cy="12" r="1.3" />
        <circle cx="18" cy="12" r="1.3" />
      </svg>
      <svg
        width="118"
        height="118"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ position: 'absolute', top: '62%', left: '7%', opacity: 0.045, transform: 'rotate(9deg)' }}
      >
        <rect x="3" y="8" width="18" height="12" rx="1.5" />
        <path d="M3 8l3-4h4l-3 4M10 8l3-4h4l-3 4" />
      </svg>
      <svg
        width="128"
        height="128"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ position: 'absolute', top: 170, right: 64, opacity: 0.05, transform: 'rotate(14deg)' }}
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <svg
        width="104"
        height="104"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        style={{ position: 'absolute', top: '54%', right: '6%', opacity: 0.045, transform: 'rotate(-6deg)' }}
      >
        <path d="M4 5h16v14H4z" />
        <path d="M4 9h16M9 5v14" />
      </svg>
      <svg
        width="88"
        height="88"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        style={{ position: 'absolute', bottom: 90, left: '46%', opacity: 0.04 }}
      >
        <path d="M5 4v16l14-8z" />
      </svg>
    </div>
  )
}

function HomeFeatured() {
  return (
    <>
      <AskHero />
      <Rows />
    </>
  )
}

/** Replaces the old backdrop carousel: the Flixmate assistant, front and
    centre, so finding something to watch starts with asking for it. */
function AskHero() {
  const { state } = useStore()
  const firstName = state.user?.displayName?.split(' ')[0]

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 22,
        overflow: 'hidden',
        padding: 'clamp(40px, 7vw, 64px) 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: 'var(--fm-surface)',
        border: '1px solid var(--fm-border)',
        boxShadow: '0 24px 70px rgba(0,0,0,.25)',
        animation: 'fmScale .5s ease'
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(58% 60% at 50% 0%, var(--fm-accentsoft), transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', animation: 'fmBob 3.4s ease-in-out infinite', marginBottom: 18 }}>
        <Mascot size={62} />
      </div>

      <h1
        className="fm-disp"
        style={{
          position: 'relative',
          margin: '0 0 10px',
          fontSize: 'clamp(28px, 4.4vw, 44px)',
          lineHeight: 1.02
        }}
      >
        {firstName ? `Hi ${firstName}, what` : 'What'} should we watch next?
      </h1>
      <p
        style={{
          position: 'relative',
          margin: '0 0 26px',
          color: 'var(--fm-muted)',
          fontWeight: 600,
          fontSize: 15.5,
          maxWidth: 480
        }}
      >
        Tell me a vibe, an actor, or the kind of night you want. I know your taste.
      </p>

      <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>
        <ChatComposer variant="landing" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
          {CHAT_CHIPS.map((c) => (
            <SuggestionChip key={c} label={c} rounded />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Trending + a personalized row from the loaded pool, then a genre row per
 * entry in GENRE_ROWS, each fetched live from TMDb so paging never runs dry.
 */
function Rows() {
  const { state } = useStore()

  const { trending, recommended } = useMemo(() => {
    const byPopularity = [...state.movies].sort((a, b) => b.popularity - a.popularity)
    const byRating = [...state.movies].sort((a, b) => b.rating - a.rating)

    const loved = Object.entries(state.ratings)
      .filter(([, v]) => v >= 4)
      .map(([id]) => state.movies.find((m) => m.id === Number(id)))
      .filter(Boolean)
    const tasteGenres = loved.length ? [...new Set(loved.flatMap((m) => m.genres))] : ['Sci-Fi', 'Thriller']

    return {
      trending: byPopularity.slice(0, 24),
      recommended: byRating.filter((m) => m.genres.some((g) => tasteGenres.includes(g))).slice(0, 24)
    }
  }, [state.movies, state.ratings])

  return (
    <>
      <StaticRow title="Trending Now" items={trending} />
      <StaticRow title="Recommended for You" items={recommended} />
      {GENRE_ROWS.map((g) => (
        <GenreRow key={g.key} title={g.title} withGenres={g.withGenres} />
      ))}
    </>
  )
}

/** A row over an already-loaded, fixed list (the pool, sliced client-side). */
function StaticRow({ title, items }) {
  const [expanded, setExpanded] = useState(false)
  if (!items.length) return null
  const list = expanded ? items : items.slice(0, 9)

  return (
    <section style={{ marginTop: 44 }}>
      <RowHeader title={title} expanded={expanded} onToggle={() => setExpanded((e) => !e)} showToggle={items.length > 9} />
      {expanded ? (
        <div style={{ ...RESULT_GRID, gap: 18, padding: '4px 2px 16px' }}>
          {list.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <RowScroller>
          {list.map((m) => (
            <div key={m.id} style={{ flex: 'none', width: 174, scrollSnapAlign: 'start' }}>
              <PosterCard movie={m} />
            </div>
          ))}
        </RowScroller>
      )}
    </section>
  )
}

/**
 * A row backed by TMDb's real /discover/movie for one genre. "See all" opens
 * a grid with its own "Load more" that keeps paging in fresh titles rather
 * than stopping at whatever loaded first.
 */
function GenreRow({ title, withGenres }) {
  const { state, cacheMovies } = useStore()
  const [expanded, setExpanded] = useState(false)

  const fetchPage = useCallback(
    (page) => api.discoverMovies({ with_genres: withGenres, sort_by: 'popularity.desc', page }),
    [withGenres]
  )
  const adapt = useCallback((m) => adaptMovie(m, state.genreMap), [state.genreMap])
  const { items, loadMore, hasMore, loading } = usePaginatedList(fetchPage, adapt)

  useEffect(() => {
    if (items.length) cacheMovies(items)
  }, [items, cacheMovies])

  if (!items.length) return null
  const list = expanded ? items : items.slice(0, 20)

  return (
    <section style={{ marginTop: 44 }}>
      <RowHeader title={title} expanded={expanded} onToggle={() => setExpanded((e) => !e)} showToggle />
      {expanded ? (
        <>
          <div style={{ ...RESULT_GRID, gap: 18, padding: '4px 2px 16px' }}>
            {list.map((m) => (
              <PosterCard key={m.id} movie={m} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <LoadMoreButton onClick={loadMore} loading={loading} />
            </div>
          )}
        </>
      ) : (
        <RowScroller onNearEnd={hasMore ? loadMore : undefined}>
          {list.map((m) => (
            <div key={m.id} style={{ flex: 'none', width: 174, scrollSnapAlign: 'start' }}>
              <PosterCard movie={m} />
            </div>
          ))}
        </RowScroller>
      )}
    </section>
  )
}

function RowHeader({ title, expanded, onToggle, showToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 className="fm-disp" style={{ margin: 0, fontSize: 29, letterSpacing: '-.2px' }}>
        {title}
      </h2>
      {showToggle && <SeeAll expanded={expanded} onClick={onToggle} />}
    </div>
  )
}

function SeeAll({ expanded, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        border: 'none',
        background: 'none',
        color: hov ? 'var(--fm-accent)' : 'var(--fm-muted)',
        fontWeight: 800,
        fontSize: 12,
        cursor: 'pointer',
        letterSpacing: '.6px'
      }}
    >
      {expanded ? 'Show less' : 'SEE ALL ›'}
    </button>
  )
}

function LoadMoreButton({ onClick, loading }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '11px 26px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 12,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13.5,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1
      }}
    >
      {loading ? 'Loading…' : 'Load more'}
    </button>
  )
}

/** In-place result grid shown on Home the moment a filter becomes active. */
function HomeResults() {
  const { state, results, resetFilters } = useStore()
  const chips = useActiveChips()

  const heading = state.mood
    ? `${state.mood} mood`
    : state.query
      ? `"${state.query}"`
      : state.genre !== 'all'
        ? state.genre
        : 'All titles'

  return (
    <div style={{ animation: 'fmFade .35s ease' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: 'var(--fm-muted)', fontWeight: 700, marginBottom: 4 }}>
            {results.length} titles
          </div>
          <h1 className="fm-disp" style={{ margin: 0, fontSize: 44, lineHeight: 1 }}>
            {heading}
          </h1>
        </div>
        <ClearButton onClick={resetFilters} />
      </div>

      <ActiveChips chips={chips} />

      {results.length ? (
        <div style={RESULT_GRID}>
          {results.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <NoResults hint="Loosen a filter or clear to see featured films." />
      )}
    </div>
  )
}

function ClearButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
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
      ✕ Clear · back to featured
    </button>
  )
}
