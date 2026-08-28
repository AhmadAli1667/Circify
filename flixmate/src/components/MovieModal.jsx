import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { useMovieReviews } from '../app/useMovieReviews'
import { backdrop, grad } from '../app/art'
import { compactCount, timeAgo, useHover, useIsMobile } from '../app/ui'
import LinkedReviewText from './LinkedReviewText'
import PosterImage from './PosterImage'
import RowScroller from './RowScroller'

const TABS = [
  { k: 'overview', l: 'Overview' },
  { k: 'watch', l: 'Where to watch' },
  { k: 'reviews', l: 'Reviews' }
]

// A Critics score needs a real sample behind it before it's worth flaunting.
const CERTIFIED_MIN_SCORE = 7
const CERTIFIED_MIN_REVIEWS = 3

export default function MovieModal() {
  const {
    state,
    patch,
    openMovie,
    openActor,
    openCastCrew,
    toggleWatch,
    setRating,
    playTrailer,
    cacheMovies,
    getMovie
  } = useStore()
  const movie = state.modalId ? getMovie(state.modalId) : null
  const detail = useMovieDetails(movie?.id, state.genreMap)
  const { reviews, total: reviewTotal, loading: reviewsLoading } = useMovieReviews(movie?.id)

  useEffect(() => {
    if (detail?.recommendations?.length) cacheMovies(detail.recommendations)
  }, [detail, cacheMovies])

  if (!movie) return null

  const inWatch = state.watchlist.includes(movie.id)
  const userRating = state.ratings[movie.id] || 0
  const effective = state.hoverStar || userRating
  const hasBackdrop = Boolean(movie.backdropUrl)
  const activeTab = state.modalTab || 'overview'

  // "Critics" reads as the smaller pool who wrote a scored review, vs. the
  // Audience score (TMDb's full vote average) everyone's star vote feeds.
  const scoredReviews = reviews.filter((r) => r.rating10 != null)
  const criticsScore = scoredReviews.length
    ? Math.round((scoredReviews.reduce((sum, r) => sum + r.rating10, 0) / scoredReviews.length) * 10) / 10
    : null
  const certified = criticsScore != null && criticsScore >= CERTIFIED_MIN_SCORE && scoredReviews.length >= CERTIFIED_MIN_REVIEWS

  const synopsis =
    state.synExpanded && detail?.director
      ? `${movie.synopsis} Directed by ${detail.director}. As the story unfolds, loyalties fracture and every choice carries a cost, building to a finale audiences won’t stop talking about.`
      : movie.synopsis

  const close = () => patch({ modalId: null })

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,.74)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
        animation: 'fmFade .25s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 900,
          background: 'var(--fm-surface)',
          border: '1px solid var(--fm-border)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 34px 90px rgba(0,0,0,.55)',
          animation: 'fmScale .3s ease'
        }}
      >
        {hasBackdrop ? (
          <BackdropBanner movie={movie} certified={certified} onClose={close} />
        ) : (
          <SplitBanner
            movie={movie}
            detail={detail}
            inWatch={inWatch}
            criticsScore={criticsScore}
            reviewCount={reviewTotal}
            certified={certified}
            onClose={close}
            onToggleWatch={() => toggleWatch(movie.id)}
            onPlayTrailer={() => playTrailer(movie.id)}
          />
        )}

        <div style={{ padding: '24px 36px 36px' }}>
          {hasBackdrop && (
            <MetaRow
              movie={movie}
              detail={detail}
              inWatch={inWatch}
              criticsScore={criticsScore}
              reviewCount={reviewTotal}
              onToggleWatch={() => toggleWatch(movie.id)}
              onPlayTrailer={() => playTrailer(movie.id)}
            />
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '15px 18px',
              background: 'var(--fm-input)',
              borderRadius: 14,
              marginBottom: 24,
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 14 }}>Your rating</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(movie.id, n)}
                  onMouseEnter={() => patch({ hoverStar: n })}
                  onMouseLeave={() => patch({ hoverStar: 0 })}
                  aria-label={`Rate ${n} of 5`}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 26,
                    color: n <= effective ? '#ffce54' : 'var(--fm-border)',
                    padding: 0,
                    lineHeight: 1,
                    transition: 'transform .12s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <span style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--fm-muted)' }}>
              {userRating ? `You rated ${userRating}/5` : 'Tap to rate'}
            </span>
          </div>

          <TabStrip tabs={TABS} active={activeTab} onChange={(k) => patch({ modalTab: k })} />

          <div key={activeTab} style={{ animation: 'fmSlide .25s ease' }}>
            {activeTab === 'overview' && (
              <OverviewTab
                detail={detail}
                reviews={reviews}
                synopsis={synopsis}
                synExpanded={state.synExpanded}
                onToggleSyn={() => patch((s) => ({ synExpanded: !s.synExpanded }))}
                onOpenActor={openActor}
                onOpenMovie={openMovie}
                onOpenCastCrew={() => openCastCrew(movie.id)}
              />
            )}
            {activeTab === 'watch' && <WhereToWatch detail={detail} />}
            {activeTab === 'reviews' && (
              <ReviewsTab
                reviews={reviews}
                total={reviewTotal}
                loading={reviewsLoading}
                cast={detail?.cast || []}
                onOpenActor={openActor}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Banner for titles with a real landscape backdrop image. */
function BackdropBanner({ movie, certified, onClose }) {
  return (
    <div style={{ position: 'relative', height: 360, background: backdrop(movie.hue) }}>
      <PosterImage src={movie.backdropUrl} objectPosition="center 30%" opacity={0.9} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg,var(--fm-surface) 2%,transparent 58%)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg,rgba(0,0,0,.5),transparent 62%)'
        }}
      />
      <CertifiedBadge show={certified} />
      <CloseButton onClick={onClose} />
      <div style={{ position: 'absolute', bottom: 26, left: 36, right: 36 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: '#fff',
            opacity: 0.85,
            marginBottom: 8
          }}
        >
          Feature Film
        </div>
        <h1
          className="fm-disp"
          style={{
            margin: 0,
            fontSize: 52,
            lineHeight: 0.96,
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,.5)'
          }}
        >
          {movie.title}
        </h1>
      </div>
    </div>
  )
}

/**
 * Banner for titles with no landscape backdrop (concert films, some
 * documentaries): a portrait poster stretched across a wide banner crops
 * badly, so this shows the poster at its real aspect ratio instead, with the
 * title/meta/actions alongside it rather than overlaid on top of it.
 */
function SplitBanner({ movie, detail, inWatch, criticsScore, reviewCount, certified, onClose, onToggleWatch, onPlayTrailer }) {
  const isMobile = useIsMobile()
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        textAlign: isMobile ? 'center' : 'left',
        gap: 20,
        padding: isMobile ? '32px 20px 8px' : '32px 36px 8px',
        background: grad(movie.hue)
      }}
    >
      <CertifiedBadge show={certified} />
      <CloseButton onClick={onClose} />
      <div
        style={{
          flex: 'none',
          width: 168,
          aspectRatio: '2/3',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 14px 34px rgba(0,0,0,.4)',
          background: grad(movie.hue)
        }}
      >
        <PosterImage src={movie.posterUrl} />
      </div>
      <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined, paddingTop: isMobile ? 0 : 4 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
            color: '#fff',
            opacity: 0.85,
            marginBottom: 8
          }}
        >
          Feature Film
        </div>
        <h1
          className="fm-disp"
          style={{
            margin: '0 0 14px',
            fontSize: 38,
            lineHeight: 1,
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,.5)'
          }}
        >
          {movie.title}
        </h1>
        <MetaRow
          movie={movie}
          detail={detail}
          inWatch={inWatch}
          criticsScore={criticsScore}
          reviewCount={reviewCount}
          onToggleWatch={onToggleWatch}
          onPlayTrailer={onPlayTrailer}
          light
        />
      </div>
    </div>
  )
}

function MetaRow({ movie, detail, inWatch, criticsScore, reviewCount, onToggleWatch, onPlayTrailer, light }) {
  const muted = light ? 'rgba(255,255,255,.78)' : 'var(--fm-muted)'
  const text = light ? '#fff' : 'var(--fm-text)'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: light ? 18 : 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', color: muted, fontWeight: 700, fontSize: 14 }}>
        <ScoreBadges movie={movie} criticsScore={criticsScore} reviewCount={reviewCount} light={light} />
        <span>·</span>
        <span>{movie.year}</span>
        {detail?.runtime && (
          <>
            <span>·</span>
            <span>{detail.runtime}</span>
          </>
        )}
        <span>·</span>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 7,
            background: light ? 'rgba(255,255,255,.16)' : 'var(--fm-input)',
            color: text,
            fontSize: 12
          }}
        >
          {movie.genres.join(' · ')}
        </span>
        {detail?.director && (
          <>
            <span>·</span>
            <span>Dir. {detail.director}</span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <PlayButton onClick={onPlayTrailer} />
        <button
          onClick={onToggleWatch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '12px 18px',
            border: `1px solid ${inWatch ? 'var(--fm-accent)' : light ? 'rgba(255,255,255,.4)' : 'var(--fm-border)'}`,
            background: inWatch ? 'var(--fm-accent)' : light ? 'rgba(255,255,255,.14)' : 'var(--fm-input)',
            borderRadius: 12,
            color: inWatch ? '#fff' : text,
            fontWeight: 800,
            fontSize: 13.5,
            cursor: 'pointer',
            transition: 'all .2s'
          }}
        >
          {inWatch ? '✓ On watchlist' : '＋ Watchlist'}
        </button>
      </div>
    </div>
  )
}

/** Audience (TMDb's full vote average) beside Critics (the average score
    among people who wrote an actual review), the way Rotten Tomatoes splits
    its Tomatometer from the Popcornmeter. */
function ScoreBadges({ movie, criticsScore, reviewCount, light }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <ScorePill label="Audience" value={movie.rating} count={movie.voteCount} light={light} />
      {criticsScore != null && (
        <ScorePill label="Critics" value={criticsScore} count={reviewCount} light={light} accent />
      )}
    </span>
  )
}

function ScorePill({ label, value, count, light, accent }) {
  return (
    <span
      title={`${compactCount(count)} ${label === 'Critics' ? 'scored reviews' : 'votes'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 8,
        background: accent ? 'var(--fm-accentsoft)' : light ? 'rgba(255,255,255,.16)' : 'var(--fm-input)',
        border: accent ? '1px solid var(--fm-accent)' : 'none'
      }}
    >
      <span style={{ color: '#ffce54', fontWeight: 800 }}>★</span>
      <span style={{ color: light ? '#fff' : 'var(--fm-text)', fontWeight: 900 }}>{value}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '.4px',
          color: accent ? 'var(--fm-accent)' : light ? 'rgba(255,255,255,.65)' : 'var(--fm-muted)'
        }}
      >
        {label}
      </span>
    </span>
  )
}

function TabStrip({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--fm-border)', marginBottom: 20 }}>
      {tabs.map((t) => {
        const isActive = active === t.k
        return (
          <button
            key={t.k}
            onClick={() => onChange(t.k)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              color: isActive ? 'var(--fm-text)' : 'var(--fm-muted)',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              borderBottom: `2.5px solid ${isActive ? 'var(--fm-accent)' : 'transparent'}`,
              marginBottom: -1
            }}
          >
            {t.l}
          </button>
        )
      })}
    </div>
  )
}

function OverviewTab({ detail, reviews, synopsis, synExpanded, onToggleSyn, onOpenActor, onOpenMovie, onOpenCastCrew }) {
  const cast = detail?.cast || []
  const related = detail?.recommendations || []

  return (
    <div>
      <p className={synExpanded ? undefined : 'fm-clamp-3'} style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>
        {synopsis}
      </p>
      <button
        onClick={onToggleSyn}
        style={{
          border: 'none',
          background: 'none',
          color: 'var(--fm-accent)',
          fontWeight: 800,
          fontSize: 13,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 24
        }}
      >
        {synExpanded ? 'Read less' : 'Read more'}
      </button>

      <PullQuote reviews={reviews} cast={cast} onOpenActor={onOpenActor} />

      <SectionHead>
        Top cast
        <button
          onClick={onOpenCastCrew}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'none',
            color: 'var(--fm-accent)',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
            textTransform: 'none',
            letterSpacing: 0
          }}
        >
          View full cast &amp; crew ›
        </button>
      </SectionHead>
      {detail ? (
        cast.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(86px,1fr))', gap: 16, marginBottom: 28 }}>
            {cast.map((c) => (
              <CastCircle key={c.id} person={c} onClick={() => onOpenActor(c.id)} />
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600, marginBottom: 28 }}>No cast listed for this title.</p>
        )
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600, marginBottom: 28 }}>Loading…</p>
      )}

      <SectionHead>More like this</SectionHead>
      {detail ? (
        related.length ? (
          <RowScroller gap={14}>
            {related.map((m) => (
              <MiniPoster key={m.id} movie={m} onClick={() => onOpenMovie(m.id)} />
            ))}
          </RowScroller>
        ) : (
          <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>No recommendations found.</p>
        )
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>Loading…</p>
      )}
    </div>
  )
}

const PULL_QUOTE_ROTATE_MS = 7000

/**
 * A rotating pull-quote pulled from this title's real TMDb reviews, the way
 * Rotten Tomatoes runs a "Critics Consensus" line, except the pool it draws
 * from is built fresh per movie from whichever quotable, positive reviews
 * that title actually has, and it cycles through several rather than
 * pinning the same one on every visit.
 */
function PullQuote({ reviews, cast, onOpenActor }) {
  const quotes = useMemo(() => buildPullQuotes(reviews), [reviews])
  const [index, setIndex] = useState(0)
  const [trackedQuotes, setTrackedQuotes] = useState(quotes)

  if (quotes !== trackedQuotes) {
    setTrackedQuotes(quotes)
    if (index !== 0) setIndex(0)
  }

  useEffect(() => {
    if (quotes.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % quotes.length), PULL_QUOTE_ROTATE_MS)
    return () => clearInterval(timer)
  }, [quotes])

  if (!quotes.length) return null
  const q = quotes[index] ?? quotes[0]

  return (
    <div
      key={q.id}
      style={{
        padding: '14px 18px',
        marginBottom: 24,
        borderRadius: 14,
        borderLeft: '3px solid var(--fm-accent)',
        background: 'var(--fm-input)',
        animation: 'fmFade .4s ease'
      }}
    >
      <p
        style={{
          margin: '0 0 7px',
          fontSize: 14.5,
          lineHeight: 1.55,
          fontWeight: 600,
          fontStyle: 'italic',
          color: 'var(--fm-text)'
        }}
      >
        “<LinkedReviewText text={q.snippet} cast={cast} onOpenActor={onOpenActor} />”
      </p>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--fm-muted)' }}>
        — {q.author}
        {q.rating10 != null ? ` · ${q.rating10}/10` : ''}
      </div>
    </div>
  )
}

/** Positive, reasonably substantial reviews only, highest-scored first. */
function buildPullQuotes(reviews) {
  return reviews
    .filter((r) => r.text && r.text.length >= 60 && (r.rating10 == null || r.rating10 >= 7))
    .sort((a, b) => (b.rating10 ?? 0) - (a.rating10 ?? 0))
    .slice(0, 6)
    .map((r) => ({ id: r.id, author: r.author, rating10: r.rating10, snippet: truncateQuote(r.text) }))
}

function truncateQuote(text, max = 200) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max)}…`
}

/** Real TMDb reviews for this title, sorted highest-scored first. */
function ReviewsTab({ reviews, total, loading, cast, onOpenActor }) {
  const sorted = [...reviews].sort((a, b) => (b.rating10 ?? -1) - (a.rating10 ?? -1))

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 78, borderRadius: 14, background: 'var(--fm-input)' }} />
        ))}
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>
        No reviews yet on TMDb for this title. Be the first to rate it above.
      </p>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 700, marginBottom: 16 }}>
        {compactCount(total)} review{total === 1 ? '' : 's'} from TMDb
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((review) => (
          <ModalReviewRow key={review.id} review={review} cast={cast} onOpenActor={onOpenActor} />
        ))}
      </div>
    </div>
  )
}

function ModalReviewRow({ review, cast, onOpenActor }) {
  const [expanded, setExpanded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const long = review.text.length > 260

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'var(--fm-input)',
        borderRadius: 14,
        padding: '13px 16px'
      }}
    >
      <span
        style={{
          position: 'relative',
          width: 34,
          height: 34,
          flex: 'none',
          borderRadius: '50%',
          overflow: 'hidden',
          background: grad(review.hue),
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontWeight: 900,
          fontSize: 13
        }}
      >
        {review.avatarUrl && !imgFailed ? (
          <img
            src={review.avatarUrl}
            alt=""
            onError={() => setImgFailed(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          review.initial
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: 13.5 }}>{review.author}</span>
          {review.stars !== null && (
            <>
              <span style={{ color: '#ffce54', fontSize: 12 }}>{'★'.repeat(Math.round(review.stars))}</span>
              <span style={{ color: 'var(--fm-muted)', fontSize: 11, fontWeight: 700 }}>{review.rating10}/10</span>
            </>
          )}
          <span style={{ color: 'var(--fm-muted)', fontSize: 11, fontWeight: 600 }}>{timeAgo(review.createdAt)}</span>
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--fm-text)',
            fontWeight: 500,
            lineHeight: 1.55,
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
              color: 'var(--fm-accent)',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  )
}

function SectionHead({ children }) {
  return (
    <h3
      style={{
        margin: '0 0 12px',
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: '.7px',
        textTransform: 'uppercase',
        color: 'var(--fm-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }}
    >
      {children}
    </h3>
  )
}

/** Real regional availability from TMDb/JustWatch (US region). */
function WhereToWatch({ detail }) {
  if (!detail) {
    return <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>Loading…</p>
  }

  const p = detail.providers
  if (!p) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>
        Not currently available to stream, rent, or buy in the US.
      </p>
    )
  }

  const groups = [
    ['Stream', p.flatrate],
    ['Rent', p.rent],
    ['Buy', p.buy]
  ].filter(([, list]) => list?.length)

  return (
    <div>
      {groups.map(([groupLabel, list]) => (
        <div key={groupLabel} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--fm-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              width: 46,
              flex: 'none'
            }}
          >
            {groupLabel}
          </span>
          {list.slice(0, 6).map((prov) => (
            <img
              key={prov.provider_id}
              src={`https://image.tmdb.org/t/p/w92${prov.logo_path}`}
              alt={prov.provider_name}
              title={prov.provider_name}
              width={34}
              height={34}
              style={{ borderRadius: 9 }}
            />
          ))}
        </div>
      ))}
      {p.link && (
        <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, color: 'var(--fm-accent)' }}>
          See all options on TMDb ↗
        </a>
      )}
    </div>
  )
}

function CloseButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label="Close"
      style={{
        position: 'absolute',
        top: 18,
        right: 18,
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        background: hov ? 'var(--fm-accent)' : 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        fontSize: 18,
        cursor: 'pointer',
        fontWeight: 700,
        zIndex: 2
      }}
    >
      ✕
    </button>
  )
}

/** Flagged only once the Critics score clears a real bar with a real sample
    behind it (see CERTIFIED_MIN_SCORE/CERTIFIED_MIN_REVIEWS above). */
function CertifiedBadge({ show }) {
  if (!show) return null
  return (
    <div
      style={{
        position: 'absolute',
        top: 18,
        left: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px',
        borderRadius: 8,
        background: 'linear-gradient(90deg,#ffb020,#ff7a1a)',
        color: '#1a1005',
        fontWeight: 900,
        fontSize: 10.5,
        letterSpacing: '.5px',
        zIndex: 2
      }}
    >
      🏆 CERTIFIED
    </div>
  )
}

function PlayButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 22px',
        border: 'none',
        borderRadius: 12,
        background: '#fff',
        color: '#141014',
        fontWeight: 900,
        fontSize: 14,
        cursor: 'pointer',
        transform: hov ? 'scale(1.03)' : 'none',
        transition: 'transform .2s'
      }}
    >
      <span style={{ fontSize: 11 }}>▶</span> Play trailer
    </button>
  )
}

function CastCircle({ person, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div onClick={onClick} style={{ textAlign: 'center', cursor: 'pointer' }}>
      <div
        {...bind}
        style={{
          position: 'relative',
          width: 76,
          height: 76,
          margin: '0 auto 9px',
          borderRadius: '50%',
          background: grad(person.hue),
          display: 'grid',
          placeItems: 'center',
          color: 'rgba(255,255,255,.9)',
          fontWeight: 900,
          fontSize: 23,
          overflow: 'hidden',
          transform: hov ? 'scale(1.06)' : 'none',
          transition: 'transform .2s'
        }}
      >
        {person.initial}
        <PosterImage src={person.imageUrl} alt={person.name} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 12.5, lineHeight: 1.2 }}>{person.name}</div>
      <div style={{ fontSize: 11, color: 'var(--fm-muted)', fontWeight: 600, marginTop: 2 }}>{person.character}</div>
    </div>
  )
}

function MiniPoster({ movie, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div
      {...bind}
      onClick={onClick}
      style={{
        flex: 'none',
        width: 120,
        cursor: 'pointer',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'transform .25s'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 178,
          borderRadius: 12,
          overflow: 'hidden',
          background: grad(movie.hue)
        }}
      >
        <PosterImage src={movie.posterUrl} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.84) 6%,transparent 56%)'
          }}
        />
        <div style={{ position: 'absolute', bottom: 0, padding: 9 }}>
          <div style={{ fontSize: 10.5, color: '#ffce54', fontWeight: 800, marginBottom: 2 }}>★ {movie.rating}</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: '#fff', lineHeight: 1.15 }}>{movie.title}</div>
        </div>
      </div>
    </div>
  )
}
