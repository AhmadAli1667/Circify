import { useEffect, useState } from 'react'
import { useStore } from '../app/storeContext'
import * as api from '../app/tmdbApi'
import { grad, hueFor, initialsOf } from '../app/art'
import PosterImage from '../components/PosterImage'
import { LoadingLine } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * Full cast & crew for one title. Fetches `/movies/:id/credits` directly
 * rather than going through useMovieDetails, this page wants the complete
 * arrays (dozens of names), not the modal's trimmed top-8 preview.
 */
export default function CastCrew() {
  const { state, nav, openActor, getMovie } = useStore()
  const movie = state.castCrewId ? getMovie(state.castCrewId) : null
  const [entry, setEntry] = useState({ id: null, credits: null })

  useEffect(() => {
    if (!state.castCrewId) return
    let alive = true
    api.getMovieCredits(state.castCrewId).then((data) => {
      if (alive) setEntry({ id: state.castCrewId, credits: data })
    })
    return () => {
      alive = false
    }
  }, [state.castCrewId])

  const credits = entry.id === state.castCrewId ? entry.credits : null

  if (!state.castCrewId || !movie) {
    return (
      <div style={{ padding: 40, maxWidth: 1180, margin: '0 auto' }}>
        <BackBtn onClick={() => nav('home')} />
        <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>No title selected.</p>
      </div>
    )
  }

  const cast = credits?.cast || []
  const crewByDept = new Map()
  for (const c of credits?.crew || []) {
    if (!crewByDept.has(c.department)) crewByDept.set(c.department, [])
    crewByDept.get(c.department).push(c)
  }

  return (
    <div
      className="fm-page-pad"
      style={{ paddingTop: 34, paddingBottom: 64, maxWidth: 1180, margin: '0 auto', animation: 'fmFade .35s ease' }}
    >
      <BackBtn onClick={() => nav('home')} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 36 }}>
        <div style={{ width: 58, height: 87, flex: 'none', borderRadius: 10, overflow: 'hidden', position: 'relative', background: grad(movie.hue) }}>
          <PosterImage src={movie.posterUrl} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--fm-accent)', marginBottom: 4 }}>
            Full cast &amp; crew
          </div>
          <h1 className="fm-disp" style={{ margin: 0, fontSize: 38, lineHeight: 1 }}>
            {movie.title}
          </h1>
        </div>
      </div>

      {!credits ? (
        <LoadingLine />
      ) : (
        <>
          <h2 className="fm-disp" style={{ margin: '0 0 18px', fontSize: 26 }}>
            Cast <span style={{ color: 'var(--fm-muted)', fontSize: 16, fontWeight: 600 }}>({cast.length})</span>
          </h2>
          {cast.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
                gap: 4,
                marginBottom: 44
              }}
            >
              {cast.map((c) => (
                <PersonRow
                  key={`${c.credit_id}`}
                  id={c.id}
                  name={c.name}
                  sub={c.character}
                  imageUrl={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null}
                  onClick={() => openActor(c.id)}
                />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--fm-muted)', fontWeight: 600, marginBottom: 44 }}>No cast listed for this title.</p>
          )}

          <h2 className="fm-disp" style={{ margin: '0 0 18px', fontSize: 26 }}>
            Crew <span style={{ color: 'var(--fm-muted)', fontSize: 16, fontWeight: 600 }}>({(credits.crew || []).length})</span>
          </h2>
          {crewByDept.size ? (
            [...crewByDept.entries()].map(([dept, people]) => (
              <section key={dept} style={{ marginBottom: 30 }}>
                <h3
                  style={{
                    margin: '0 0 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: '.7px',
                    textTransform: 'uppercase',
                    color: 'var(--fm-muted)'
                  }}
                >
                  {dept}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 4 }}>
                  {people.map((c) => (
                    <PersonRow
                      key={`${c.credit_id}`}
                      id={c.id}
                      name={c.name}
                      sub={c.job}
                      imageUrl={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null}
                      onClick={() => openActor(c.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <p style={{ color: 'var(--fm-muted)', fontWeight: 600 }}>No crew listed for this title.</p>
          )}
        </>
      )}
    </div>
  )
}

function PersonRow({ name, sub, imageUrl, onClick }) {
  const [hov, bind] = useHover()
  const hue = hueFor(name)
  return (
    <div
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        borderRadius: 12,
        cursor: 'pointer',
        background: hov ? 'var(--fm-hover)' : 'transparent',
        transition: 'background .15s'
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          flex: 'none',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          background: grad(hue),
          display: 'grid',
          placeItems: 'center',
          color: 'rgba(255,255,255,.9)',
          fontWeight: 900,
          fontSize: 14
        }}
      >
        {initialsOf(name)}
        <PosterImage src={imageUrl} alt={name} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--fm-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </div>
      </div>
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
