import { useStore } from '../app/storeContext'
import { getActor, filmsOf } from '../app/catalog'
import { grad } from '../app/art'
import PosterCard from '../components/PosterCard'
import PosterImage from '../components/PosterImage'
import { SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * Actor page. Names with a record in data/actors.js get their photograph and
 * biography; everyone else billed in the catalogue gets a monogram card and a
 * flagged placeholder instead of invented prose.
 */
export default function Actor() {
  const { state, nav } = useStore()
  const actor = getActor(state.actorSlug)

  if (!actor) {
    return (
      <div style={{ padding: 40, maxWidth: 1180, margin: '0 auto' }}>
        <BackBtn onClick={() => nav('home')} />
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>That performer isn&apos;t in the catalogue.</p>
      </div>
    )
  }

  const films = filmsOf(actor.slug)
  const avgRating = films.length ? (films.reduce((a, b) => a + b.rating, 0) / films.length).toFixed(1) : '—'
  const topFilm = films.length ? films.reduce((a, b) => (b.rating > a.rating ? b : a)).title : '—'

  const stats = [
    { value: films.length, label: 'Films in catalogue' },
    { value: avgRating, label: 'Avg. rating' },
    { value: topFilm, label: 'Top film' }
  ]

  return (
    <div style={{ padding: 40, maxWidth: 1180, margin: '0 auto', animation: 'fmFade .35s ease' }}>
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
              marginBottom: 8
            }}
          >
            Actor
            {actor.knownForRole && (
              <span style={{ color: 'var(--fm-muted)', letterSpacing: '.4px', textTransform: 'none', fontWeight: 700 }}>
                · known for {actor.knownForRole}
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
              Biography for {actor.name} — coming soon <SoonTag />
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

          {actor.social?.wikipedia && (
            <a
              href={actor.social.wikipedia}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 20, fontWeight: 800, fontSize: 13.5 }}
            >
              Wikipedia ↗
            </a>
          )}
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
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>
          No titles from this performer are in the catalogue yet.
        </p>
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
