import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { useMovieReviews } from '../app/useMovieReviews'
import { usePaginatedList } from '../app/usePaginatedList'
import { adaptMovie } from '../app/catalog'
import * as api from '../app/tmdbApi'
import { backdrop, grad, initialsOf } from '../app/art'
import LinkedReviewText from '../components/LinkedReviewText'
import PosterImage from '../components/PosterImage'
import { compactCount, timeAgo, useHover, useIsMobile } from '../app/ui'

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

/* --- shape language ---------------------------------------------------------
   This page is deliberately square-cut: 4px on surfaces, 2px on controls, and
   circles only where a short-form feed actually uses them, the action rail's
   glyph buttons and the avatars. No pills, no soft blobs.
   -------------------------------------------------------------------------- */
const R = 4
const R_SM = 2

const RAIL_W = 74
const PANEL_W = 520
const GAP = 16
/** Sliver of the next card left showing under the current one. */
const PEEK = 34

const SURFACE = '#151517'
const PAGE = '#0b0b0d'
const HAIR = 'rgba(255,255,255,.09)'
const STAR = '#ffc53d'

/**
 * For You: a two-column short-form feed. Left is one pick per screen (poster
 * or auto-playing trailer) with its action rail beside it; right is the
 * reviews panel, which stays open and re-fills itself as the feed scrolls,
 * the way a comments pane does on a shorts player.
 *
 * The reviews are TMDb's real community reviews for whichever title is on
 * screen (author, avatar, score out of 10, body, timestamp), read as comments
 * with the star rating sitting inline with the name.
 *
 * Always painted on a near-black surface regardless of the app's light/dark
 * theme: an immersive viewer reads as its own thing, not as themed page
 * chrome.
 */
export default function ForYou() {
  const { state, nav, cacheMovies } = useStore()
  const isMobile = useIsMobile()
  const feedEl = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const [panelPref, setPanelPref] = useState(false)

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
  const activeMovie = feed.find((m) => m.id === effectiveActiveId) || null
  const activeIndex = feed.findIndex((m) => m.id === effectiveActiveId)
  const panelOpen = panelPref
  const peek = isMobile ? 0 : PEEK

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

  const scroll = useCallback(
    (dir) => {
      const target = feed[activeIndex + dir]
      if (!target) return
      feedEl.current
        ?.querySelector(`[data-movie-id="${target.id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [feed, activeIndex]
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowUp') scroll(-1)
      else if (e.key === 'ArrowDown') scroll(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [scroll])

  const columnWidth = isMobile
    ? '100vw'
    : `min(430px, calc((100dvh - var(--fm-navbar-h, 70px) - ${GAP * 2}px) * 0.5625), ` +
      `calc(100vw - ${RAIL_W + (panelOpen ? PANEL_W : 0) + 130}px))`

  return (
    <div
      style={{
        position: 'relative',
        background: PAGE,
        height: isMobile ? '100dvh' : 'calc(100dvh - var(--fm-navbar-h, 70px))',
        overflow: 'hidden',
        animation: 'fmFade .35s ease'
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: 26,
          padding: isMobile ? 0 : `${GAP}px 0`
        }}
      >
        <div style={{ position: 'relative', display: 'flex', gap: 10, height: '100%' }}>
          <div
            ref={feedEl}
            onScroll={onScroll}
            className="fm-noscrollbar"
            style={{
              width: columnWidth,
              height: '100%',
              overflowY: 'auto',
              scrollSnapType: 'y mandatory',
              overscrollBehavior: 'contain'
            }}
          >
            {feed.map((m, i) => (
              <FeedItem
                key={m.id}
                movie={m}
                reason={REASONS[i % REASONS.length]}
                isActive={m.id === effectiveActiveId}
                isMobile={isMobile}
                genreMap={state.genreMap}
                peek={peek}
                progress={feed.length ? (i + 1) / feed.length : 0}
              />
            ))}
          </div>

          {/* One rail, owned by whichever card is on screen. Outside the frame
              on desktop like the reference feed, overlaid on it at phone width
              where there's no room beside the video. */}
          {activeMovie && (
            <div
              style={
                isMobile
                  ? { position: 'absolute', right: 10, bottom: 104, zIndex: 6 }
                  : { width: RAIL_W, display: 'flex', alignItems: 'flex-end', paddingBottom: peek + 12 }
              }
            >
              <ActionRail movie={activeMovie} panelOpen={panelOpen} onComments={() => setPanelPref(!panelOpen)} />
            </div>
          )}
        </div>

        {panelOpen && activeMovie && (
          <ReviewsPanel movie={activeMovie} isMobile={isMobile} onClose={() => setPanelPref(false)} />
        )}
      </div>

      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 8
          }}
        >
          <PagerButton label="Previous pick" onClick={() => scroll(-1)} icon={<ChevronUpIcon />} />
          <PagerButton label="Next pick" onClick={() => scroll(1)} icon={<ChevronDownIcon />} />
        </div>
      )}

      <SquareButton
        label="Back"
        onClick={() => nav('home')}
        icon={<BackArrowIcon />}
        style={{ position: 'absolute', top: isMobile ? 12 : 18, left: isMobile ? 12 : 18, zIndex: 9 }}
      />
    </div>
  )
}

/* --- the card ------------------------------------------------------------ */

function FeedItem({ movie, reason, isActive, isMobile, genreMap, peek, progress }) {
  const { state, patch, openMovie, playTrailer } = useStore()
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const [pausedForKey, setPausedForKey] = useState(null)
  const videoRef = useRef(null)
  const skipRef = useRef(0)

  // Poster vs trailer is a feed-wide mode, not a per-card choice, so picking
  // one on any card carries to whatever the next card scrolled to is. Only
  // the active card ever actually renders a trailer, off-screen cards stay
  // posters regardless of mode, so idle cards don't all autoplay at once.
  const tab = isActive && state.feedMode === 'trailer' ? 'trailer' : 'poster'
  const detail = useMovieDetails(tab === 'trailer' ? movie.id : null, genreMap)
  const setTab = (t) => patch({ feedMode: t })

  if (detail?.trailerKey && detail.trailerKey !== pausedForKey) {
    setPausedForKey(detail.trailerKey)
    if (paused) setPaused(false)
  }

  const postCommand = (func, args = []) => {
    videoRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
  }

  useEffect(() => {
    if (tab === 'trailer' && detail?.trailerKey) postCommand(muted ? 'mute' : 'unMute')
  }, [muted, tab, detail?.trailerKey])

  useEffect(() => {
    skipRef.current = 0
  }, [detail?.trailerKey])

  const togglePlay = () => {
    postCommand(paused ? 'playVideo' : 'pauseVideo')
    setPaused((p) => !p)
  }

  // No YouTube API player instance here, just the bare postMessage protocol,
  // so there's no getCurrentTime() to read. Each tap instead jumps to a
  // running 10s-further mark, reset whenever a new trailer loads.
  const skipForward = () => {
    skipRef.current += 10
    postCommand('seekTo', [skipRef.current, true])
    if (paused) {
      postCommand('playVideo')
      setPaused(false)
    }
  }

  const art = movie.backdropUrl || movie.posterUrl

  return (
    <div
      data-movie-id={movie.id}
      style={{
        height: `calc(100% - ${peek}px)`,
        marginBottom: peek ? 8 : 0,
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always'
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          borderRadius: isMobile ? 0 : R,
          border: isMobile ? 'none' : `1px solid ${HAIR}`,
          background: backdrop(movie.hue)
        }}
      >
        {/* Blurred art fills the 9:16 frame behind letterboxed 16:9 trailers,
            the way a vertical player pads out landscape footage. Kept bright
            enough to read as the title's own colour, not as dead black. */}
        {art && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: -30,
              background: `center/cover no-repeat url(${art})`,
              filter: 'blur(26px) brightness(.62) saturate(1.15)'
            }}
          />
        )}

        {tab === 'poster' && <PosterImage src={movie.posterUrl} alt={`${movie.title} poster`} />}

        {tab === 'trailer' &&
          (detail?.trailerKey ? (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
                {/* pointer-events off on purpose: it keeps YouTube's own hover
                    chrome out of the frame and lets a wheel/swipe over the
                    video scroll the feed instead of being eaten by the embed.
                    Sound is the card's own control. */}
                <iframe
                  ref={videoRef}
                  title={`${movie.title} trailer`}
                  src={`https://www.youtube.com/embed/${detail.trailerKey}?autoplay=1&mute=1&loop=1&playlist=${detail.trailerKey}&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1`}
                  allow="autoplay; encrypted-media"
                  onLoad={() => {
                    postCommand(muted ? 'mute' : 'unMute')
                    if (paused) postCommand('pauseVideo')
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                padding: 28,
                textAlign: 'center'
              }}
            >
              <div>
                <div style={{ display: 'grid', placeItems: 'center', color: '#fff', opacity: 0.85, marginBottom: 12 }}>
                  <PlayIcon size={34} />
                </div>
                {!detail ? (
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>Loading trailer…</div>
                ) : (
                  <>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 14 }}>
                      No trailer on file for this one
                    </div>
                    <a
                      href={movie.trailerLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '9px 16px',
                        borderRadius: R_SM,
                        background: 'rgba(255,255,255,.12)',
                        border: `1px solid ${HAIR}`,
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 12.5
                      }}
                    >
                      Search YouTube ↗
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}

        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.95) 4%,rgba(0,0,0,.06) 46%,rgba(0,0,0,.34))',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 12,
            left: isMobile ? 58 : 12,
            right: 12,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            gap: 8
          }}
        >
          <div style={{ position: 'absolute', left: '50%', top: 4, transform: 'translateX(-50%)' }}>
            <WorldTabs tab={tab} onChange={setTab} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 'none' }}>
            <SquareButton label="Movie info" onClick={() => openMovie(movie.id)} icon={<InfoIcon />} />
            {tab === 'trailer' && detail?.trailerKey && (
              <>
                <SquareButton
                  label={paused ? 'Play trailer' : 'Pause trailer'}
                  onClick={togglePlay}
                  icon={paused ? <PlayIcon size={13} /> : <PauseIcon />}
                />
                <SquareButton label="Skip forward 10s" onClick={skipForward} icon={<ForwardIcon />} />
                <SquareButton
                  label={muted ? 'Unmute trailer' : 'Mute trailer'}
                  onClick={() => setMuted((m) => !m)}
                  icon={muted ? <MutedIcon /> : <SoundIcon />}
                />
                <SquareButton
                  label="Open full-page trailer"
                  onClick={() => playTrailer(movie.id)}
                  icon={<ExpandIcon />}
                />
              </>
            )}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: isMobile ? 68 : 0,
            padding: '18px 16px 20px'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              marginBottom: 10,
              padding: '6px 10px',
              borderRadius: R_SM,
              background: 'rgba(8,8,10,.7)',
              border: `1px solid ${HAIR}`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <span style={{ width: 5, height: 5, flex: 'none', background: 'var(--fm-accent)' }} />
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 10.5 }}>{reason}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              color: 'rgba(255,255,255,.8)',
              fontWeight: 700,
              fontSize: 11.5,
              flexWrap: 'wrap'
            }}
          >
            <span style={{ color: STAR }}>★ {movie.rating}</span>
            <span>· {movie.year}</span>
            <span>· {movie.genre}</span>
            <span>· {compactCount(movie.voteCount)} TMDb votes</span>
          </div>

          <div
            className="fm-disp"
            onClick={() => openMovie(movie.id)}
            style={{
              fontSize: 31,
              lineHeight: 0.98,
              color: '#fff',
              cursor: 'pointer',
              marginBottom: 8,
              textShadow: '0 2px 18px rgba(0,0,0,.6)'
            }}
          >
            {movie.title}
          </div>

          <p
            className="fm-clamp-2"
            style={{
              margin: '0 0 14px',
              color: 'rgba(255,255,255,.84)',
              fontWeight: 500,
              fontSize: 12,
              lineHeight: 1.45
            }}
          >
            {movie.synopsis}
          </p>
        </div>

        {/* Position in the loaded feed, not playback time, this is the same
            place a shorts player puts its scrubber. */}
        <div
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,.16)' }}
        >
          <div style={{ width: `${Math.min(100, progress * 100)}%`, height: '100%', background: 'var(--fm-accent)' }} />
        </div>
      </div>
    </div>
  )
}

/* --- action rail --------------------------------------------------------- */

function ActionRail({ movie, panelOpen, onComments }) {
  const { state, patch, toggleWatch, openMovie } = useStore()
  const { total } = useMovieReviews(movie.id)

  const liked = Boolean(state.feedLiked[movie.id])
  const saved = state.watchlist.includes(movie.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <RailButton
        label={compactCount(movie.voteCount + (liked ? 1 : 0))}
        ariaLabel="Like"
        active={liked}
        icon={<HeartIcon filled={liked} />}
        onClick={() => patch((s) => ({ feedLiked: { ...s.feedLiked, [movie.id]: !s.feedLiked[movie.id] } }))}
      />
      <RailButton
        label={compactCount(total)}
        ariaLabel="Reviews"
        active={panelOpen}
        icon={<CommentIcon />}
        onClick={onComments}
      />
      <RailButton label="Share" icon={<ShareIcon />} onClick={() => patch({ shareOpen: true })} />
      <RailButton
        label={saved ? 'Saved' : 'Save'}
        active={saved}
        icon={saved ? <CheckIcon /> : <PlusIcon />}
        onClick={() => toggleWatch(movie.id)}
      />
      <button
        onClick={() => openMovie(movie.id)}
        aria-label={`Open ${movie.title}`}
        style={{
          position: 'relative',
          width: 46,
          height: 46,
          padding: 0,
          overflow: 'hidden',
          borderRadius: R_SM,
          border: '1px solid rgba(255,255,255,.45)',
          background: grad(movie.hue),
          cursor: 'pointer'
        }}
      >
        <PosterImage src={movie.posterUrl} alt="" />
      </button>
    </div>
  )
}

function RailButton({ icon, label, ariaLabel, active, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <button
        {...bind}
        onClick={onClick}
        aria-label={ariaLabel || label}
        style={{
          width: 46,
          height: 46,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: 'none',
          background: hov ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)',
          backdropFilter: 'blur(6px)',
          color: active ? 'var(--fm-accent)' : '#fff',
          cursor: 'pointer',
          transition: 'background .15s, color .15s'
        }}
      >
        {icon}
      </button>
      <span style={{ color: '#fff', fontSize: 11.5, fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,.6)' }}>
        {label}
      </span>
    </div>
  )
}

/* --- reviews panel ------------------------------------------------------- */

/**
 * Reviews read as a comment thread: avatar, handle, the score inline with the
 * name, body, timestamp. These are TMDb's real reviews for the title on
 * screen, so the big titles carry a few and smaller ones honestly carry none.
 *
 * Desktop keeps the panel beside the card (the trailer keeps playing next to
 * it); phone width gets a bottom sheet, which is what a shorts player does
 * there.
 */
function ReviewsPanel({ movie, isMobile, onClose }) {
  const { state, setRating, showSoon, openActor } = useStore()
  const { reviews, total, loading } = useMovieReviews(movie.id)
  const detail = useMovieDetails(movie.id, state.genreMap)
  const cast = detail?.cast || []
  const [sort, setSort] = useState('top')
  const [draft, setDraft] = useState('')

  const sorted = useMemo(() => {
    const list = [...reviews]
    if (sort === 'new') return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    return list.sort((a, b) => (b.rating10 ?? -1) - (a.rating10 ?? -1))
  }, [reviews, sort])

  const frame = isMobile
    ? {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: '72dvh',
        zIndex: 60,
        borderTop: `1px solid ${HAIR}`,
        borderRadius: `${R}px ${R}px 0 0`,
        animation: 'fmPop .2s ease'
      }
    : {
        width: `clamp(320px, 38vw, ${PANEL_W}px)`,
        height: '100%',
        border: `1px solid ${HAIR}`,
        borderRadius: R,
        animation: 'fmSlide .2s ease'
      }

  const post = () => {
    if (!draft.trim()) return
    setDraft('')
    showSoon('Written reviews')
  }

  return (
    <>
      {isMobile && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,.5)' }} />
      )}
      <section
        style={{
          ...frame,
          background: SURFACE,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <header
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '15px 16px',
            borderBottom: `1px solid ${HAIR}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, minWidth: 0 }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 17 }}>Reviews</span>
            <span style={{ color: 'rgba(255,255,255,.55)', fontWeight: 700, fontSize: 13.5 }}>
              {compactCount(total)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
            <FlatButton subtle onClick={() => setSort((s) => (s === 'top' ? 'new' : 'top'))}>
              <SortIcon />
              <span style={{ marginLeft: 7 }}>{sort === 'top' ? 'Top rated' : 'Newest'}</span>
            </FlatButton>
            <SquareButton label="Close reviews" onClick={onClose} icon={<CloseIcon />} />
          </div>
        </header>

        <div style={{ flex: 'none', padding: '10px 16px', borderBottom: `1px solid ${HAIR}` }}>
          <div className="fm-clamp-2" style={{ color: 'rgba(255,255,255,.62)', fontSize: 11.5, fontWeight: 700 }}>
            {movie.title} · {movie.year}
          </div>
        </div>

        <div className="fm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 10px' }}>
          {loading && [0, 1, 2].map((i) => <ReviewSkeleton key={i} />)}

          {!loading && !sorted.length && (
            <div style={{ padding: '34px 4px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>No reviews yet</div>
              <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5, fontWeight: 600, lineHeight: 1.5 }}>
                Nobody has written one for {movie.title} on TMDb. Your star rating below still counts.
              </div>
            </div>
          )}

          {!loading &&
            sorted.map((review) => <ReviewRow key={review.id} review={review} cast={cast} onOpenActor={openActor} />)}
        </div>

        <footer
          style={{
            flex: 'none',
            padding: `12px 16px calc(14px + ${isMobile ? 'env(safe-area-inset-bottom, 0px)' : '0px'})`,
            borderTop: `1px solid ${HAIR}`
          }}
        >
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <Avatar
              src={state.avatar}
              seed={state.user?.displayName || 'You'}
              text={initialsOf(state.user?.displayName || 'You')}
              size={34}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <RatingPicker value={state.ratings[movie.id] || 0} onPick={(v) => setRating(movie.id, v)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && post()}
                  placeholder="Add a review…"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '7px 2px',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,.28)',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                {draft.trim() && <FlatButton onClick={post}>Post</FlatButton>}
              </div>
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,.4)', fontSize: 10.5, fontWeight: 700 }}>
                Stars save to your profile · written reviews aren&apos;t wired up yet
              </div>
            </div>
          </div>
        </footer>
      </section>
    </>
  )
}

function ReviewRow({ review, cast, onOpenActor }) {
  const { showSoon } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const long = review.text.length > 230

  return (
    <article style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
      <Avatar src={review.avatarUrl} seed={review.hue} text={review.initial} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 12.5 }}>{review.handle}</span>
          {review.stars !== null && (
            <>
              <Stars value={review.stars} />
              <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700 }}>{review.rating10}/10</span>
            </>
          )}
          <span style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, fontWeight: 600 }}>
            {timeAgo(review.createdAt)}
          </span>
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,.88)',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            ...(expanded
              ? {}
              : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' })
          }}
        >
          <LinkedReviewText text={review.text} cast={cast} onOpenActor={onOpenActor} />
        </div>

        {long && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              marginTop: 5,
              padding: 0,
              border: 'none',
              background: 'transparent',
              color: 'rgba(255,255,255,.6)',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 9 }}>
          <RowAction
            label="Helpful"
            active={liked}
            icon={<ThumbUpIcon />}
            onClick={() => {
              setLiked((v) => !v)
              setDisliked(false)
            }}
          />
          <RowAction
            label="Not helpful"
            hideLabel
            active={disliked}
            icon={<ThumbDownIcon />}
            onClick={() => {
              setDisliked((v) => !v)
              setLiked(false)
            }}
          />
          <RowAction label="Reply" onClick={() => showSoon('Review replies')} />
          {review.url && (
            <a
              href={review.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, fontWeight: 800 }}
            >
              TMDb ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function ReviewSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0' }}>
      <div style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
      <div style={{ flex: 1 }}>
        {[52, 100, 100, 74].map((w, i) => (
          <div
            key={w}
            style={{
              height: i ? 9 : 11,
              width: `${w}%`,
              marginBottom: 8,
              borderRadius: R_SM,
              background: 'rgba(255,255,255,.07)'
            }}
          />
        ))}
      </div>
    </div>
  )
}

function RowAction({ icon, label, active, hideLabel, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 0,
        border: 'none',
        background: 'transparent',
        color: active ? 'var(--fm-accent)' : `rgba(255,255,255,${hov ? '.9' : '.55'})`,
        fontSize: 11.5,
        fontWeight: 800,
        cursor: 'pointer',
        transition: 'color .15s'
      }}
    >
      {icon}
      {!hideLabel && <span>{label}</span>}
    </button>
  )
}

/** Five glyphs with the score painted over them, so half-stars land exactly. */
function Stars({ value, size = 11 }) {
  const pct = Math.max(0, Math.min(1, value / 5)) * 100
  return (
    <span
      aria-label={`${value} out of 5 stars`}
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: 1.5,
        color: 'rgba(255,255,255,.22)'
      }}
    >
      ★★★★★
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${pct}%`,
          overflow: 'hidden',
          letterSpacing: 1.5,
          color: STAR
        }}
      >
        ★★★★★
      </span>
    </span>
  )
}

/** The composer's own star row, wired to the account's real rating. */
function RatingPicker({ value, onPick }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 2 }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onClick={() => onPick(n)}
            aria-label={`Rate ${n} of 5`}
            style={{
              padding: '0 1px',
              border: 'none',
              background: 'transparent',
              color: n <= shown ? STAR : 'rgba(255,255,255,.26)',
              fontSize: 16,
              lineHeight: 1,
              cursor: 'pointer',
              transition: 'color .12s'
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700 }}>
        {value ? `You rated this ${value}/5` : 'Rate it'}
      </span>
    </div>
  )
}

function Avatar({ src, seed, text, size }) {
  const [failed, setFailed] = useState(false)
  const hue = typeof seed === 'number' ? seed : (String(seed).charCodeAt(0) * 7) % 360
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        borderRadius: '50%',
        background: grad(hue),
        color: '#fff',
        fontWeight: 900,
        fontSize: size * 0.36
      }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        text
      )}
    </span>
  )
}

/* --- world tabs: poster vs. trailer read as two separate panes, the way a
   shorts app's top nav switches feeds, not as a small corner toggle. -------- */

function WorldTabs({ tab, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 22 }}>
      {[
        ['poster', 'Poster'],
        ['trailer', 'Trailer']
      ].map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            position: 'relative',
            padding: '4px 1px 9px',
            border: 'none',
            background: 'transparent',
            color: tab === id ? '#fff' : 'rgba(255,255,255,.55)',
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 0.3,
            textShadow: '0 1px 6px rgba(0,0,0,.6)',
            cursor: 'pointer',
            transition: 'color .15s'
          }}
        >
          {label}
          {tab === id && (
            <span
              aria-hidden
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: '#fff' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

/* --- squared controls ---------------------------------------------------- */

function FlatButton({ children, onClick, subtle }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: subtle ? '6px 10px' : '9px 16px',
        borderRadius: R_SM,
        border: `1px solid ${hov ? 'rgba(255,255,255,.4)' : HAIR}`,
        background: hov ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)',
        color: '#fff',
        fontWeight: 800,
        fontSize: subtle ? 11.5 : 13,
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s'
      }}
    >
      {children}
    </button>
  )
}

function SquareButton({ icon, label, onClick, style }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 32,
        height: 32,
        display: 'grid',
        placeItems: 'center',
        borderRadius: R_SM,
        border: `1px solid ${hov ? 'rgba(255,255,255,.4)' : HAIR}`,
        background: hov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s',
        ...style
      }}
    >
      {icon}
    </button>
  )
}

function PagerButton({ icon, label, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 42,
        height: 42,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: 'none',
        background: hov ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.11)',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background .15s'
      }}
    >
      {icon}
    </button>
  )
}

/* --- icons ---------------------------------------------------------------
   Line icons rather than emoji: the rail and the comment rows need to read as
   one set at small sizes, which colour emoji never do.
   ------------------------------------------------------------------------- */

function Svg({ children, size = 20, fill = 'none', width = 1.9 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      {children}
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <Svg size={21} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </Svg>
  )
}

function CommentIcon() {
  return (
    <Svg size={20}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  )
}

function ShareIcon() {
  return (
    <Svg size={20}>
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </Svg>
  )
}

function PlusIcon() {
  return (
    <Svg size={21}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

function CheckIcon() {
  return (
    <Svg size={20}>
      <path d="M20 6L9 17l-5-5" />
    </Svg>
  )
}

function ChevronUpIcon() {
  return (
    <Svg size={20}>
      <path d="M18 15l-6-6-6 6" />
    </Svg>
  )
}

function ChevronDownIcon() {
  return (
    <Svg size={20}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  )
}

function BackArrowIcon() {
  return (
    <Svg size={17}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </Svg>
  )
}

function CloseIcon() {
  return (
    <Svg size={16}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  )
}

function SortIcon() {
  return (
    <Svg size={14}>
      <path d="M4 6h16M4 12h10M4 18h5" />
    </Svg>
  )
}

function ThumbUpIcon() {
  return (
    <Svg size={15} width={1.8}>
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </Svg>
  )
}

function ThumbDownIcon() {
  return (
    <Svg size={15} width={1.8}>
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.7a2 2 0 0 0-2 1.7l-1.4 9a2 2 0 0 0 2 2.3z" />
      <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
    </Svg>
  )
}

function MutedIcon() {
  return (
    <Svg size={16}>
      <path d="M11 5L6 9H2v6h4l5 4z" />
      <path d="M23 9l-6 6M17 9l6 6" />
    </Svg>
  )
}

function SoundIcon() {
  return (
    <Svg size={16}>
      <path d="M11 5L6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
    </Svg>
  )
}

function PlayIcon({ size = 24 }) {
  return (
    <Svg size={size} fill="currentColor" width={0}>
      <path d="M8 5v14l11-7z" />
    </Svg>
  )
}

function PauseIcon() {
  return (
    <Svg size={14} fill="currentColor" width={0}>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Svg>
  )
}

function ForwardIcon() {
  return (
    <Svg size={16} fill="currentColor" width={0}>
      <path d="M3 5v14l9-7z" />
      <path d="M12 5v14l9-7z" />
    </Svg>
  )
}

function ExpandIcon() {
  return (
    <Svg size={16}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </Svg>
  )
}

function InfoIcon() {
  return (
    <Svg size={16}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  )
}
