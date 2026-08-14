import { useEffect } from 'react'
import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { backdrop, grad } from '../app/art'
import { REVIEW_POOL, useHover } from '../app/ui'
import PosterImage from './PosterImage'
import RowScroller from './RowScroller'

const TABS = [
  { k: 'overview', l: 'Overview' },
  { k: 'watch', l: 'Where to watch' },
  { k: 'reviews', l: 'Reviews' }
]

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

  useEffect(() => {
    if (detail?.recommendations?.length) cacheMovies(detail.recommendations)
  }, [detail, cacheMovies])

  if (!movie) return null

  const inWatch = state.watchlist.includes(movie.id)
  const userRating = state.ratings[movie.id] || 0
  const effective = state.hoverStar || userRating
  const hasBackdrop = Boolean(movie.backdropUrl)
  const activeTab = state.modalTab || 'overview'

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
          <BackdropBanner movie={movie} onClose={close} />
        ) : (
          <SplitBanner
            movie={movie}
            detail={detail}
            inWatch={inWatch}
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
                synopsis={synopsis}
                synExpanded={state.synExpanded}
                onToggleSyn={() => patch((s) => ({ synExpanded: !s.synExpanded }))}
                onOpenActor={openActor}
                onOpenMovie={openMovie}
                onOpenCastCrew={() => openCastCrew(movie.id)}
              />
            )}
            {activeTab === 'watch' && <WhereToWatch detail={detail} />}
            {activeTab === 'reviews' && <ReviewsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Banner for titles with a real landscape backdrop image. */
function BackdropBanner({ movie, onClose }) {
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
function SplitBanner({ movie, detail, inWatch, onClose, onToggleWatch, onPlayTrailer }) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 28, padding: '32px 36px 8px', background: grad(movie.hue) }}>
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
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
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
        <MetaRow movie={movie} detail={detail} inWatch={inWatch} onToggleWatch={onToggleWatch} onPlayTrailer={onPlayTrailer} light />
      </div>
    </div>
  )
}

function MetaRow({ movie, detail, inWatch, onToggleWatch, onPlayTrailer, light }) {
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
        <span style={{ color: '#ffce54', fontWeight: 800 }}>
          ★ <span style={{ color: text }}>{movie.rating}</span>
        </span>
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

function OverviewTab({ detail, synopsis, synExpanded, onToggleSyn, onOpenActor, onOpenMovie, onOpenCastCrew }) {
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

function ReviewsTab() {
  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 700, marginBottom: 16 }}>
        Sample reviews. There's no review feed behind these yet.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {REVIEW_POOL.map(([who, hue, stars, text]) => (
          <div
            key={who}
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
                width: 34,
                height: 34,
                flex: 'none',
                borderRadius: '50%',
                background: grad(hue),
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 13
              }}
            >
              {who[0]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{who}</span>
                <span style={{ color: '#ffce54', fontSize: 12 }}>{stars}</span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 500, lineHeight: 1.5 }}>{text}</div>
            </div>
          </div>
        ))}
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
