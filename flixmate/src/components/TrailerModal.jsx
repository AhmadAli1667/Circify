import { useStore } from '../app/storeContext'
import { getMovie } from '../app/catalog'
import { backdrop } from '../app/art'
import { SoonTag } from './primitives'
import { useHover } from '../app/ui'

/**
 * Trailer player.
 *
 * The catalogue stores a YouTube *search* link per title, not an embeddable
 * video id, so nothing can play inline yet. Rather than embedding an unrelated
 * placeholder clip, this says so and hands off to YouTube.
 */
export default function TrailerModal() {
  const { state, patch } = useStore()
  const movie = state.trailerId ? getMovie(state.trailerId) : null
  if (!movie) return null

  const close = () => patch({ trailerId: null })

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 95,
        background: 'rgba(0,0,0,.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 36,
        animation: 'fmFade .25s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1080,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span
            style={{
              color: 'var(--fm-accent)',
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              flex: 'none'
            }}
          >
            Trailer
          </span>
          <span
            className="fm-disp"
            style={{
              color: '#fff',
              fontSize: 26,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {movie.title}
          </span>
        </div>
        <CloseButton onClick={close} />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 1080,
          aspectRatio: '16/9',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(0,0,0,.7)',
          background: backdrop(movie.hue),
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          padding: 32
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 52, marginBottom: 14, color: '#fff' }}>▶</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              color: '#fff',
              fontWeight: 900,
              fontSize: 22,
              marginBottom: 10
            }}
          >
            In-app trailer playback <SoonTag />
          </div>
          <p
            style={{
              margin: '0 auto 22px',
              maxWidth: 420,
              color: 'rgba(255,255,255,.75)',
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.55
            }}
          >
            The catalogue doesn&apos;t carry trailer video ids yet. Until it does, this opens the trailer search on
            YouTube instead of playing a placeholder clip.
          </p>
          <a
            href={movie.trailerLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '13px 26px',
              borderRadius: 13,
              background: '#fff',
              color: '#141014',
              fontWeight: 900,
              fontSize: 15
            }}
          >
            Watch on YouTube ↗
          </a>
        </div>
      </div>

      <div style={{ marginTop: 14, color: 'rgba(255,255,255,.5)', fontSize: 12.5, fontWeight: 600 }}>
        Tap outside to close
      </div>
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
        width: 42,
        height: 42,
        flex: 'none',
        borderRadius: '50%',
        border: 'none',
        background: hov ? 'var(--fm-accent)' : 'rgba(255,255,255,.12)',
        color: '#fff',
        fontSize: 18,
        cursor: 'pointer',
        transition: 'background .2s'
      }}
    >
      ✕
    </button>
  )
}
