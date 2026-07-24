import { useState } from 'react'
import { useStore } from '../app/storeContext'
import { grad } from '../app/art'
import { useHover } from '../app/ui'

/**
 * The poster tile used by Home rows, Search, Watchlist, Actor filmography and
 * the modal's "more like this" strip.
 *
 * Titles with real cover art render the image; the rest fall back to the
 * mockup's hue gradient with the display-serif title set over it.
 */
export default function PosterCard({ movie }) {
  const { state, openMovie, toggleWatch } = useStore()
  const [hov, bind] = useHover()
  const [imgFailed, setImgFailed] = useState(false)

  const inWatch = state.watchlist.includes(movie.id)
  const showArt = Boolean(movie.posterUrl) && !imgFailed
  const credits = `Starring ${movie.leadCast.join(' · ')}`

  return (
    <div onClick={() => openMovie(movie.id)} style={{ width: '100%', cursor: 'pointer' }}>
      <div
        {...bind}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 16,
          overflow: 'hidden',
          background: grad(movie.hue),
          boxShadow: hov ? '0 24px 46px rgba(0,0,0,.5)' : '0 12px 30px rgba(0,0,0,.32)',
          transform: hov ? 'translateY(-9px)' : 'none',
          transition: 'transform .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s ease'
        }}
      >
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            onLoad={() => setImgFailed(false)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              // Hidden rather than unmounted so onError still fires.
              visibility: imgFailed ? 'hidden' : 'visible'
            }}
          />
        )}

        {/* film-grain + directional sheen, from the mockup */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            mixBlendMode: 'overlay',
            backgroundImage: 'radial-gradient(rgba(255,255,255,.7) .5px, transparent .6px)',
            backgroundSize: '3px 3px'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(125deg,rgba(255,255,255,.18) 0%,transparent 32%,transparent 64%,rgba(0,0,0,.22) 100%)'
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '13px 13px 0'
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.7)',
              textShadow: '0 1px 6px rgba(0,0,0,.7)'
            }}
          >
            {movie.genre}
          </span>
          {movie.kind === 'series' && (
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                background: 'rgba(0,0,0,.5)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                fontWeight: 900,
                fontSize: 9,
                letterSpacing: '.6px'
              }}
            >
              SERIES
            </span>
          )}
        </div>

        <WatchButton inWatch={inWatch} onClick={() => toggleWatch(movie.id)} />

        {!showArt && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: '30%', padding: '0 16px', textAlign: 'center' }}>
            <div
              className="fm-disp"
              style={{
                fontSize: 27,
                lineHeight: 1,
                color: '#fff',
                textShadow: '0 2px 16px rgba(0,0,0,.55)',
                letterSpacing: '.2px'
              }}
            >
              {movie.title}
            </div>
            <div
              style={{
                marginTop: 7,
                fontSize: 10,
                fontWeight: 700,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,.82)',
                letterSpacing: '.3px'
              }}
            >
              {movie.tagline}
            </div>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.9) 3%,transparent 42%)'
          }}
        />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
          <div
            style={{
              fontSize: 6.5,
              letterSpacing: '.35px',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,.52)',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 9,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {credits}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#ffce54', fontSize: 12 }}>★</span>
            <span style={{ fontWeight: 800, fontSize: 12.5, color: '#fff' }}>{movie.rating}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>· {movie.year}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WatchButton({ inWatch, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      title={inWatch ? 'On watchlist' : 'Add to watchlist'}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: 'absolute',
        top: 34,
        right: 11,
        width: 32,
        height: 32,
        borderRadius: 10,
        border: 'none',
        background: hov ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.42)',
        backdropFilter: 'blur(6px)',
        color: inWatch ? 'var(--fm-accent)' : '#fff',
        cursor: 'pointer',
        fontSize: 15,
        fontWeight: 900,
        display: 'grid',
        placeItems: 'center',
        transition: 'all .2s'
      }}
    >
      {inWatch ? '✓' : '＋'}
    </button>
  )
}
