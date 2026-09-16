import { useStore } from '../app/storeContext'
import { useMovieDetails } from '../app/useMovieDetails'
import { backdrop } from '../app/art'
import { useEscape, useHover } from '../app/ui'

/**
 * Trailer player. Embeds the real YouTube trailer once the detail fetch
 * resolves a `trailerKey`. Some titles genuinely have no trailer on TMDb;
 * that case (and the brief load) falls back to a YouTube search link rather
 * than a placeholder clip.
 */
export default function TrailerModal() {
  const { state, patch, getMovie } = useStore()
  const movie = state.trailerId ? getMovie(state.trailerId) : null
  const detail = useMovieDetails(movie?.id, state.genreMap)
  const close = () => patch({ trailerId: null })
  useEscape(Boolean(movie), close)
  if (!movie) return null

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
          display: detail?.trailerKey ? 'block' : 'grid',
          placeItems: 'center',
          textAlign: 'center',
          padding: detail?.trailerKey ? 0 : 32
        }}
      >
        {detail?.trailerKey ? (
          <iframe
            title={`${movie.title} trailer`}
            src={`https://www.youtube.com/embed/${detail.trailerKey}?autoplay=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 52, marginBottom: 14, color: '#fff' }}>▶</div>
              {!detail ? (
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 18 }}>Loading trailer…</div>
              ) : (
                <>
                  <div
                    style={{
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 20,
                      marginBottom: 20
                    }}
                  >
                    Watch the trailer on YouTube
                  </div>
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
                    Open YouTube ↗
                  </a>
                </>
              )}
            </div>
          </>
        )}
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
