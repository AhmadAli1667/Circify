import { useEffect } from 'react'
import { useStore } from '../app/storeContext'
import { usePersonDetails } from '../app/usePersonDetails'
import { grad } from '../app/art'
import PosterCard from '../components/PosterCard'
import PosterImage from '../components/PosterImage'
import { SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * Actor page. Bio, photo and filmography come straight from TMDb's person +
 * combined-credits endpoints, no more curated/placeholder split, since TMDb
 * has real data for essentially every billed actor.
 */
export default function Actor() {
  const { state, nav, cacheMovies } = useStore()
  const actor = usePersonDetails(state.actorId, state.genreMap)

  useEffect(() => {
    if (actor?.filmography?.length) cacheMovies(actor.filmography)
  }, [actor, cacheMovies])

  if (!state.actorId) {
    return (
      <div className="fm-page-pad" style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 1180, margin: '0 auto' }}>
        <BackBtn onClick={() => nav('home')} />
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>No performer selected.</p>
      </div>
    )
  }

  if (!actor) {
    return (
      <div className="fm-page-pad" style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 1180, margin: '0 auto' }}>
        <BackBtn onClick={() => nav('home')} />
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>Loading…</p>
      </div>
    )
  }

  const films = actor.filmography
  const avgRating = films.length ? (films.reduce((a, b) => a + b.rating, 0) / films.length).toFixed(1) : 'N/A'
  const topFilm = films.length ? films.reduce((a, b) => (b.rating > a.rating ? b : a)).title : 'N/A'

  const stats = [
    { value: films.length, label: 'Films in filmography' },
    { value: avgRating, label: 'Avg. rating' },
    { value: topFilm, label: 'Top film' }
  ]

  return (
    <div
      className="fm-page-pad"
      style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 1180, margin: '0 auto', animation: 'fmFade .35s ease' }}
    >
      <BackBtn onClick={() => nav('home')} />

      <div style={{ display: 'flex', gap: 34, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 44 }}>
        <div
          style={{
            position: 'relative',
            width: 186,
            height: 186,
            borderRadius: 28,
            background: grad(actor.hue),
            flex: 'none',
            boxShadow: '0 16px 40px rgba(0,0,0,.34)',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            color: 'rgba(255,255,255,.92)',
            fontWeight: 900,
            fontSize: 54
          }}
        >
          {actor.initial}
          <PosterImage src={actor.imageUrl} alt={actor.name} />
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--fm-accent)',
              marginBottom: 8,
              flexWrap: 'wrap'
            }}
          >
            Actor
            {actor.knownForRole && (
              <span style={{ color: 'var(--fm-muted)', letterSpacing: '.4px', textTransform: 'none', fontWeight: 700 }}>
                · known for {actor.knownForRole}
              </span>
            )}
            {actor.age != null && (
              <span style={{ color: 'var(--fm-muted)', letterSpacing: '.4px', textTransform: 'none', fontWeight: 700 }}>
                · age {actor.age}
              </span>
            )}
            {actor.placeOfBirth && (
              <span style={{ color: 'var(--fm-muted)', letterSpacing: '.4px', textTransform: 'none', fontWeight: 700 }}>
                · {actor.placeOfBirth}
              </span>
            )}
          </div>

          <h1 className="fm-disp" style={{ margin: '0 0 16px', fontSize: 52, lineHeight: 0.98 }}>
            {actor.name}
          </h1>

          {actor.biography.length ? (
            actor.biography.map((para) => (
              <p
                key={para.slice(0, 24)}
                style={{
                  margin: '0 0 14px',
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: 'var(--fm-muted)',
                  fontWeight: 500,
                  maxWidth: 640
                }}
              >
                {para}
              </p>
            ))
          ) : (
            <p
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                margin: '0 0 14px',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'var(--fm-accentsoft)',
                color: 'var(--fm-accent)',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              No biography on file for {actor.name} <SoonTag />
            </p>
          )}

          <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', marginTop: 8 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className="fm-disp" style={{ fontSize: 30, color: 'var(--fm-text)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--fm-muted)', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="fm-disp" style={{ margin: '0 0 18px', fontSize: 30 }}>
        Filmography
      </h2>
      {films.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 18 }}>
          {films.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>No movie credits on file for this performer.</p>
      )}
    </div>
  )
}

function BackBtn({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 15px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 11,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        marginBottom: 28
      }}
    >
      ‹ Back
    </button>
  )
}
