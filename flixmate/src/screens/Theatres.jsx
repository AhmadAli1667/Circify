import { useMemo } from 'react'
import { useStore } from '../app/storeContext'
import { grad } from '../app/art'
import { useMovieProviders } from '../app/useMovieProviders'
import PosterCard from '../components/PosterCard'
import PosterImage from '../components/PosterImage'
import RowScroller from '../components/RowScroller'
import { SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * In Theatres.
 *
 * The catalogue has no real showtime feed, so the listings are drawn from
 * the newest titles rather than an actual box-office schedule; the provider
 * badges underneath each poster are real TMDb/JustWatch US availability.
 */

export default function Theatres() {
  const { state, openMovie, showSoon } = useStore()

  const { nowPlaying, comingSoon } = useMemo(() => {
    const byYear = [...state.movies].sort((a, b) => b.year - a.year || b.rating - a.rating)
    return { nowPlaying: byYear.slice(0, 6), comingSoon: byYear.slice(6, 12) }
  }, [state.movies])

  return (
    <div
      className="fm-page-pad"
      style={{ paddingTop: 34, paddingBottom: 64, maxWidth: 1440, margin: '0 auto', animation: 'fmFade .35s ease' }}
    >
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
      <RowScroller>
        {comingSoon.map((m) => (
          <div key={m.id} style={{ flex: 'none', width: 174, scrollSnapAlign: 'start' }}>
            <PosterCard movie={m} />
          </div>
        ))}
      </RowScroller>
    </div>
  )
}

function NowPlayingCard({ movie, onClick }) {
  const [hov, bind] = useHover()
  const providers = useMovieProviders(movie.id)
  const where = (providers?.flatrate || providers?.rent || providers?.buy || []).slice(0, 3)

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
          {where.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 9 }}>
              {where.map((p) => (
                <img
                  key={p.provider_id}
                  src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                  alt={p.provider_name}
                  title={p.provider_name}
                  width={26}
                  height={26}
                  style={{ borderRadius: 7 }}
                />
              ))}
            </div>
          )}
          <div className="fm-disp" style={{ fontSize: 22, color: '#fff', lineHeight: 1 }}>
            {movie.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', fontWeight: 700, marginTop: 4 }}>
            ★ {movie.rating}
          </div>
        </div>
      </div>
    </div>
  )
}
