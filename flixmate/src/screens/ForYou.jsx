import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { usePaginatedList } from '../app/usePaginatedList'
import { adaptMovie } from '../app/catalog'
import * as api from '../app/tmdbApi'
import { backdrop, grad } from '../app/art'
import PosterImage from '../components/PosterImage'
import { BackButton } from '../components/primitives'
import { REVIEW_POOL, useHover } from '../app/ui'

const REASONS = [
  'Because you rated it five stars',
  'Trending with your friends',
  'Because you watch a lot of Sci-Fi',
  'A hidden gem picked for you',
  'Your thriller streak continues',
  'Highly rated this week',
  'Fresh in your favourite genres',
  'Critics and you agree'
]

/**
 * For You: a full-height vertical snap feed, one pick per screen. Backed by
 * TMDb's popular list (paginated, genuinely doesn't run out), re-sorted so
 * whatever matches the user's rated taste surfaces first.
 */
export default function ForYou() {
  const { state, nav, cacheMovies } = useStore()
  const feedEl = useRef(null)
  const [activeId, setActiveId] = useState(null)

  const fetchPage = useCallback((page) => api.getPopular(page), [])
  const adapt = useCallback((m) => adaptMovie(m, state.genreMap), [state.genreMap])
  const { items: rawFeed, loadMore, hasMore, loading } = usePaginatedList(fetchPage, adapt)

  useEffect(() => {
    if (rawFeed.length) cacheMovies(rawFeed)
  }, [rawFeed, cacheMovies])

  const feed = useMemo(() => {
    const loved = Object.entries(state.ratings)
      .filter(([, v]) => v >= 4)
      .map(([id]) => state.movies.find((m) => m.id === Number(id)))
      .filter(Boolean)
    const tasteGenres = loved.length ? [...new Set(loved.flatMap((m) => m.genres))] : ['Sci-Fi', 'Drama']

    const tuned = rawFeed.filter((m) => m.genres.some((g) => tasteGenres.includes(g)))
    const rest = rawFeed.filter((m) => !tuned.includes(m))
    return [...tuned, ...rest]
  }, [rawFeed, state.movies, state.ratings])

  const effectiveActiveId = activeId ?? feed[0]?.id ?? null

  // Auto-play follows scroll position: whichever card is mostly in view becomes active.
  useEffect(() => {
    const root = feedEl.current
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(Number(e.target.dataset.movieId))
        })
      },
      { root, threshold: 0.6 }
    )
    root.querySelectorAll('[data-movie-id]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [feed])

  const onScroll = () => {
    const el = feedEl.current
    if (!el || loading || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - el.clientHeight) loadMore()
  }

  const scroll = (dir) => {
    if (feedEl.current) {
      feedEl.current.scrollBy({ top: dir * feedEl.current.clientHeight, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ position: 'relative', animation: 'fmFade .35s ease' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 20px 4px', textAlign: 'center', position: 'relative' }}>
        <BackButton onClick={() => nav('home')} style={{ position: 'absolute', left: 20, top: 20 }} />
        <div
          style={{
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            color: 'var(--fm-accent)',
            marginBottom: 6
          }}
        >
          Tailored to you
        </div>
        <h1 className="fm-disp" style={{ margin: '0 0 8px', fontSize: 36, lineHeight: 1 }}>
          For You, Alex
        </h1>
        <p style={{ margin: 0, color: 'var(--fm-muted)', fontWeight: 600, fontSize: 13.5 }}>
          Scroll like Shorts: one pick at a time, tuned to your taste.
        </p>
      </div>

      <div
        ref={feedEl}
        onScroll={onScroll}
        className="fm-scroll"
        style={{
          height: 'calc(100vh - 175px)',
          maxWidth: 400,
          margin: '8px auto 0',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          borderRadius: 26,
          boxShadow: '0 20px 60px rgba(0,0,0,.4)'
        }}
      >
        {feed.map((m, i) => (
          <FeedItem
            key={m.id}
            movie={m}
            reason={REASONS[i % REASONS.length]}
            isActive={m.id === effectiveActiveId}
            genreMap={state.genreMap}
          />
        ))}
      </div>

      <div
        style={{
          position: 'fixed',
          right: 'calc(50% - 244px)',
          bottom: 'calc(50vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 20
        }}
      >
        <FeedNav label="Previous" glyph="▲" onClick={() => scroll(-1)} />
        <FeedNav label="Next" glyph="▼" onClick={() => scroll(1)} />
      </div>
    </div>
  )
}

function FeedNav({ label, glyph, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-elev)',
        color: hov ? 'var(--fm-accent)' : 'var(--fm-text)',
        cursor: 'pointer',
        boxShadow: '0 8px 22px rgba(0,0,0,.3)',
        transition: 'all .2s'
      }}
    >
      {glyph}
    </button>
  )
}

function FeedItem({ movie, reason, isActive, genreMap }) {
  const { state, patch, openMovie, toggleWatch } = useStore()
  const [muted, setMuted] = useState(true)

  const liked = Boolean(state.feedLiked[movie.id])
  const saved = state.watchlist.includes(movie.id)
  const tab = state.feedTab[movie.id] ?? (isActive ? 'trailer' : 'poster')
  const detail = useMovieDetails(tab === 'trailer' ? movie.id : null, genreMap)

  const setTab = (t) => patch((s) => ({ feedTab: { ...s.feedTab, [movie.id]: t } }))

  return (
    <div
      data-movie-id={movie.id}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 175px)',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        overflow: 'hidden',
        background: backdrop(movie.hue)
      }}
    >
      {tab === 'poster' && <PosterImage src={movie.posterUrl} />}

      {tab === 'trailer' &&
        (detail?.trailerKey ? (
          <>
            <iframe
              title={`${movie.title} trailer`}
              src={`https://www.youtube.com/embed/${detail.trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${detail.trailerKey}&controls=0`}
              allow="autoplay; encrypted-media"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 3,
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,.5)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 28, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>▶</div>
              {!detail ? (
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>Loading trailer…</div>
              ) : (
                <>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, marginBottom: 14 }}>
                    Watch the trailer on YouTube
                  </div>
                  <a
                    href={movie.trailerLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '10px 18px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,.16)',
                      border: '1px solid rgba(255,255,255,.35)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 13
                    }}
                  >
                    Open YouTube ↗
                  </a>
                </>
              )}
            </div>
          </div>
        ))}

      {tab === 'comments' && (
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '70px 16px 90px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>
            Sample comments, there's no review feed behind these yet.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REVIEW_POOL.map(([who, hue, stars, text]) => (
              <div
                key={who}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,.08)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 12,
                  padding: '10px 12px'
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flex: 'none',
                    borderRadius: '50%',
                    background: grad(hue),
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 11
                  }}
                >
                  {who[0]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>{who}</span>
                    <span style={{ color: '#ffce54', fontSize: 10.5 }}>{stars}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.82)', fontWeight: 500, fontSize: 12, lineHeight: 1.4 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg,rgba(0,0,0,.94) 6%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.45))',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 13px',
            borderRadius: 20,
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fm-accent)' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 11 }}>{reason}</span>
        </div>
        <div style={{ display: 'flex', padding: 3, borderRadius: 14, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)' }}>
          <TabButton active={tab === 'poster'} onClick={() => setTab('poster')}>
            Poster
          </TabButton>
          <TabButton active={tab === 'trailer'} onClick={() => setTab('trailer')}>
            ▶ Trailer
          </TabButton>
          <TabButton active={tab === 'comments'} onClick={() => setTab('comments')}>
            Comments
          </TabButton>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '18px 14px 20px 18px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 7,
              color: 'rgba(255,255,255,.82)',
              fontWeight: 700,
              fontSize: 11.5,
              flexWrap: 'wrap'
            }}
          >
            <span style={{ color: '#ffce54' }}>★ {movie.rating}</span>
            <span>· {movie.year}</span>
            <span>· {movie.genre}</span>
          </div>

          <div
            className="fm-disp"
            onClick={() => openMovie(movie.id)}
            style={{
              fontSize: 30,
              lineHeight: 0.96,
              color: '#fff',
              cursor: 'pointer',
              marginBottom: 7,
              textShadow: '0 2px 16px rgba(0,0,0,.55)'
            }}
          >
            {movie.title}
          </div>

          <p
            className="fm-clamp-2"
            style={{
              margin: '0 0 12px',
              color: 'rgba(255,255,255,.86)',
              fontWeight: 500,
              fontSize: 12,
              lineHeight: 1.45
            }}
          >
            {movie.synopsis}
          </p>

          <DetailsButton onClick={() => openMovie(movie.id)} />
        </div>

        <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <FeedAction
            label="Like"
            glyph={liked ? '♥' : '♡'}
            colour={liked ? 'var(--fm-accent)' : '#fff'}
            onClick={() => patch((s) => ({ feedLiked: { ...s.feedLiked, [movie.id]: !s.feedLiked[movie.id] } }))}
          />
          <FeedAction
            label="Save"
            glyph={saved ? '✓' : '＋'}
            colour={saved ? 'var(--fm-accent)' : '#fff'}
            onClick={() => toggleWatch(movie.id)}
          />
          <FeedAction label="Share" glyph="↗" colour="#fff" onClick={() => patch({ shareOpen: true })} />
        </div>
      </div>
    </div>
  )
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px',
        border: 'none',
        borderRadius: 11,
        background: active ? '#fff' : 'transparent',
        color: active ? '#141014' : '#fff',
        fontWeight: 800,
        fontSize: 11.5,
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      {children}
    </button>
  )
}

function DetailsButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        padding: '11px 20px',
        border: '1px solid rgba(255,255,255,.4)',
        borderRadius: 12,
        background: hov ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.14)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13.5,
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      Details
    </button>
  )
}

function FeedAction({ label, glyph, colour, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div style={{ textAlign: 'center' }}>
      <button
        {...bind}
        onClick={onClick}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,.45)',
          backdropFilter: 'blur(8px)',
          color: colour,
          fontSize: 18,
          fontWeight: 900,
          cursor: 'pointer',
          transform: hov ? 'scale(1.12)' : 'none',
          transition: 'transform .18s'
        }}
      >
        {glyph}
      </button>
      <div style={{ color: '#fff', fontSize: 9.5, fontWeight: 700, marginTop: 3 }}>{label}</div>
    </div>
  )
}
