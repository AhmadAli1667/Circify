import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { usePaginatedList } from '../app/usePaginatedList'
import { adaptMovie } from '../app/catalog'
import * as api from '../app/tmdbApi'
import { backdrop } from '../app/art'
import PosterCard from '../components/PosterCard'
import PosterImage from '../components/PosterImage'
import RowScroller from '../components/RowScroller'
import WizardRail from '../components/WizardRail'
import Footer from '../components/Footer'
import ActiveChips, { NoResults } from '../components/ActiveChips'
import { useActiveChips } from '../app/useActiveChips'
import { RESULT_GRID, useHover } from '../app/ui'

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

  return (
    <div style={{ position: 'relative' }}>
      <AmbientIcons />
      <WizardRail />

      <div style={{ padding: '26px 40px 0 100px', maxWidth: 1620, margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
      <Hero />
      <Rows />
    </>
  )
}

function Hero() {
  const { state, patch, openMovie, playTrailer } = useStore()

  const heroList = useMemo(() => [...state.movies].sort((a, b) => b.rating - a.rating).slice(0, 5), [state.movies])
  const hm = heroList[state.heroIndex % heroList.length]
  const detail = useMovieDetails(hm?.id, state.genreMap)

  if (!hm) return null

  return (
    <div
      style={{
        position: 'relative',
        height: 462,
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(0,0,0,.45)',
        animation: 'fmScale .5s ease'
      }}
    >
      <div
        key={`hb${hm.id}`}
        style={{
          position: 'absolute',
          inset: '-10%',
          background: backdrop(hm.hue),
          animation: 'fmKen 9s ease-out both'
        }}
      >
        <PosterImage src={hm.backdropUrl} objectPosition="center 22%" />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg,rgba(0,0,0,.94) 6%,rgba(0,0,0,.5) 48%,transparent 78%)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg,rgba(0,0,0,.9) 2%,transparent 44%)'
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px 52px',
          maxWidth: 660
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: '1.8px',
              color: 'var(--fm-accent)',
              textTransform: 'uppercase'
            }}
          >
            Featured
          </span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.72)', fontWeight: 700 }}>
            {hm.genre} · {hm.year}
            {detail?.runtime ? ` · ${detail.runtime}` : ''}
          </span>
        </div>

        <h1
          className="fm-disp"
          style={{
            margin: '0 0 14px',
            fontSize: 68,
            lineHeight: 0.94,
            color: '#fff',
            textShadow: '0 2px 30px rgba(0,0,0,.5)'
          }}
        >
          {hm.title}
        </h1>
        <p
          style={{
            margin: '0 0 24px',
            fontSize: 16,
            lineHeight: 1.55,
            color: 'rgba(255,255,255,.9)',
            maxWidth: 540,
            fontWeight: 500
          }}
        >
          {hm.synopsis}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <HeroPlay onClick={() => playTrailer(hm.id)} />
          <HeroInfo onClick={() => openMovie(hm.id)} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginLeft: 4,
              padding: '10px 15px',
              background: 'rgba(0,0,0,.4)',
              borderRadius: 12
            }}
          >
            <span style={{ color: '#ffce54', fontSize: 15 }}>★</span>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{hm.rating}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 26, right: 30, display: 'flex', gap: 8 }}>
        {heroList.map((m, i) => (
          <button
            key={m.id}
            aria-label={`Show ${m.title}`}
            onClick={() => patch({ heroIndex: i })}
            style={{
              width: i === state.heroIndex ? 26 : 7,
              height: 7,
              borderRadius: 5,
              border: 'none',
              background: i === state.heroIndex ? 'var(--fm-accent)' : 'rgba(255,255,255,.4)',
              cursor: 'pointer',
              transition: 'all .35s',
              padding: 0
            }}
          />
        ))}
      </div>
    </div>
  )
}

function HeroPlay({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '14px 28px',
        border: 'none',
        borderRadius: 13,
        background: '#fff',
        color: '#141014',
        fontWeight: 900,
        fontSize: 15,
        cursor: 'pointer',
        transform: hov ? 'scale(1.04)' : 'none',
        transition: 'transform .2s'
      }}
    >
      <span style={{ fontSize: 12 }}>▶</span> Play trailer
    </button>
  )
}

function HeroInfo({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 22px',
        border: '1px solid rgba(255,255,255,.4)',
        borderRadius: 13,
        background: hov ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.14)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 15,
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      ⓘ More info
    </button>
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
