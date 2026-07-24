import { useMemo } from 'react'
import { useStore } from '../app/storeContext'
import { movies as MOVIES, getMovie, getActor } from '../app/catalog'
import { backdrop, grad, initialsOf } from '../app/art'
import { SoonTag } from './primitives'
import { useHover } from '../app/ui'
import PosterImage from './PosterImage'

/** Streaming badges are illustrative — no provider feed is wired up. */
const PROVIDERS = [
  ['Netflix', '#e50914'],
  ['Prime', '#00a8e1'],
  ['Disney+', '#113ccf']
]

export default function MovieModal() {
  const { state, patch, openMovie, openActor, toggleWatch, setRating, playTrailer } = useStore()
  const movie = state.modalId ? getMovie(state.modalId) : null

  const related = useMemo(() => {
    if (!movie) return []
    const byRating = [...MOVIES].sort((a, b) => b.rating - a.rating)
    const sequel = movie.relatedId ? [getMovie(movie.relatedId)].filter(Boolean) : []
    const sameGenre = byRating.filter((x) => x.id !== movie.id && x.genres.some((g) => movie.genres.includes(g)))
    const sameEra = byRating.filter((x) => x.id !== movie.id && Math.abs(x.year - movie.year) <= 2)
    const seen = new Set()
    return [...sequel, ...sameGenre, ...sameEra]
      .filter((x) => x && !seen.has(x.id) && seen.add(x.id))
      .slice(0, 8)
  }, [movie])

  if (!movie) return null

  const inWatch = state.watchlist.includes(movie.id)
  const userRating = state.ratings[movie.id] || 0
  const effective = state.hoverStar || userRating

  // Billed leads come from the catalogue; wider ensembles aren't in the data.
  const cast = movie.castSlugs.map((slug, i) => {
    const a = getActor(slug)
    return {
      slug,
      name: a?.name || movie.leadCast[i],
      initial: a?.initial || initialsOf(movie.leadCast[i]),
      hue: a?.hue ?? movie.hue,
      character: i === 0 ? 'Lead' : 'Co-lead',
      imageUrl: a?.imageUrl || null
    }
  })

  const synopsis = state.synExpanded
    ? `${movie.synopsis} Directed by ${movie.director}. As the story unfolds, loyalties fracture and every choice carries a cost — building to a finale audiences won’t stop talking about.`
    : movie.synopsis

  return (
    <div
      onClick={() => patch({ modalId: null })}
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
        <div style={{ position: 'relative', height: 360, background: backdrop(movie.hue) }}>
          <PosterImage src={movie.posterUrl} objectPosition="center 20%" opacity={0.65} />
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
          <CloseButton onClick={() => patch({ modalId: null })} />
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

        <div style={{ padding: '24px 36px 36px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 20
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                color: 'var(--fm-muted)',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              <span style={{ color: '#ffce54', fontWeight: 800 }}>
                ★ <span style={{ color: 'var(--fm-text)' }}>{movie.rating}</span>
              </span>
              <span>·</span>
              <span>{movie.year}</span>
              <span>·</span>
              <span>{movie.runtime}</span>
              <span>·</span>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 7,
                  background: 'var(--fm-input)',
                  color: 'var(--fm-text)',
                  fontSize: 12
                }}
              >
                {movie.genres.join(' · ')}
              </span>
              <span>·</span>
              <span>Dir. {movie.director}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <PlayButton onClick={() => playTrailer(movie.id)} />
              <button
                onClick={() => toggleWatch(movie.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '12px 18px',
                  border: `1px solid ${inWatch ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
                  background: inWatch ? 'var(--fm-accent)' : 'var(--fm-input)',
                  borderRadius: 12,
                  color: inWatch ? '#fff' : 'var(--fm-text)',
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

          <p
            className={state.synExpanded ? undefined : 'fm-clamp-3'}
            style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}
          >
            {synopsis}
          </p>
          <button
            onClick={() => patch((s) => ({ synExpanded: !s.synExpanded }))}
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
            {state.synExpanded ? 'Read less' : 'Read more'}
          </button>

          <SectionHead>
            Where to watch <SoonTag />
          </SectionHead>
          <div style={{ display: 'flex', gap: 9, marginBottom: 6, flexWrap: 'wrap' }}>
            {PROVIDERS.map(([name, bg]) => (
              <span
                key={name}
                style={{
                  padding: '8px 15px',
                  borderRadius: 10,
                  background: bg,
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 13,
                  opacity: 0.65
                }}
              >
                {name}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fm-muted)', fontWeight: 600, marginBottom: 28 }}>
            Illustrative — real availability needs a provider feed.
          </div>

          <SectionHead>Top cast</SectionHead>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(86px,1fr))',
              gap: 16,
              marginBottom: 28
            }}
          >
            {cast.map((c) => (
              <CastCircle key={c.slug} person={c} onClick={() => openActor(c.slug)} />
            ))}
          </div>

          <SectionHead>More like this</SectionHead>
          <div className="fm-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {related.map((m) => (
              <MiniPoster key={m.id} movie={m} onClick={() => openMovie(m.id)} />
            ))}
          </div>
        </div>
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
