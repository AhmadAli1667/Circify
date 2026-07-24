import { useMemo } from 'react'
import { useStore } from '../app/storeContext'
import { movies as MOVIES } from '../app/catalog'
import { grad } from '../app/art'
import PosterImage from '../components/PosterImage'
import { SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * In Theatres.
 *
 * The catalogue has no showtime or streaming-provider feed, so the listings
 * are drawn from the newest titles and the provider badges are illustrative —
 * both are flagged in the header.
 */
const PROVIDERS = [
  ['Netflix', '#e50914'],
  ['Prime', '#00a8e1'],
  ['Disney+', '#113ccf'],
  ['Max', '#7c3aed']
]

export default function Theatres() {
  const { openMovie, showSoon } = useStore()

  const { nowPlaying, comingSoon } = useMemo(() => {
    const byYear = [...MOVIES].sort((a, b) => b.year - a.year || b.rating - a.rating)
    return { nowPlaying: byYear.slice(0, 6), comingSoon: byYear.slice(6, 12) }
  }, [])

  return (
    <div style={{ padding: '34px 40px 64px', maxWidth: 1440, margin: '0 auto', animation: 'fmFade .35s ease' }}>
      <h1 className="fm-disp" style={{ margin: '0 0 6px', fontSize: 46, lineHeight: 1 }}>
        In Theatres Now
      </h1>
      <p
        style={{
          margin: '0 0 32px',
          color: 'var(--fm-muted)',
          fontWeight: 600,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexWrap: 'wrap'
        }}
      >
        Newest releases in your catalogue
        <button
          onClick={() => showSoon('Live showtimes & streaming availability')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 10px',
            border: '1px solid var(--fm-border)',
            background: 'var(--fm-input)',
            borderRadius: 9,
            color: 'var(--fm-muted)',
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer'
          }}
        >
          Live showtimes &amp; availability <SoonTag />
        </button>
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(212px,1fr))',
          gap: 22,
          marginBottom: 50
        }}
      >
        {nowPlaying.map((m) => (
          <NowPlayingCard key={m.id} movie={m} onClick={() => openMovie(m.id)} />
        ))}
      </div>

      <h2 className="fm-disp" style={{ margin: '0 0 18px', fontSize: 30 }}>
        Coming Soon
      </h2>
      <div className="fm-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 14 }}>
        {comingSoon.map((m) => (
          <div key={m.id} onClick={() => openMovie(m.id)} style={{ flex: 'none', width: 236, cursor: 'pointer' }}>
            <div
              style={{
                position: 'relative',
                width: 236,
                height: 136,
                borderRadius: 16,
                overflow: 'hidden',
                background: grad(m.hue),
                boxShadow: '0 10px 26px rgba(0,0,0,.28)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg,rgba(0,0,0,.82),transparent 64%)'
                }}
              />
              <div style={{ position: 'absolute', bottom: 13, left: 15, right: 15 }}>
                <div className="fm-disp" style={{ color: '#fff', fontSize: 19 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.68)', fontWeight: 700 }}>
                  Released {m.year}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NowPlayingCard({ movie, onClick }) {
  const [hov, bind] = useHover()
  const where = [PROVIDERS[movie.id % 4], PROVIDERS[(movie.id + 2) % 4]]

  return (
    <div
      {...bind}
      onClick={onClick}
      style={{ cursor: 'pointer', transform: hov ? 'translateY(-7px)' : 'none', transition: 'transform .25s' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 18,
          overflow: 'hidden',
          background: grad(movie.hue),
          boxShadow: '0 14px 34px rgba(0,0,0,.34)'
        }}
      >
        <PosterImage src={movie.posterUrl} />
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '5px 11px',
            borderRadius: 8,
            background: 'var(--fm-accent)',
            color: '#fff',
            fontWeight: 900,
            fontSize: 10.5,
            letterSpacing: '.5px',
            zIndex: 1
          }}
        >
          NOW PLAYING
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.9) 6%,transparent 54%)'
          }}
        />
        <div style={{ position: 'absolute', bottom: 0, padding: 16 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 9 }}>
            {where.map(([name, bg]) => (
              <span
                key={name}
                style={{
                  padding: '3px 9px',
                  borderRadius: 6,
                  background: bg,
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 10
                }}
              >
                {name}
              </span>
            ))}
          </div>
          <div className="fm-disp" style={{ fontSize: 22, color: '#fff', lineHeight: 1 }}>
            {movie.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', fontWeight: 700, marginTop: 4 }}>
            ★ {movie.rating} · {movie.runtime}
          </div>
        </div>
      </div>
    </div>
  )
}
