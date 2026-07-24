import { useStore } from '../app/storeContext'
import { getMovie } from '../app/catalog'
import { grad } from '../app/art'
import PosterImage from '../components/PosterImage'
import { SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

const TABS = [
  { k: 'watchlist', l: 'Watchlist' },
  { k: 'ratings', l: 'Ratings' },
  { k: 'activity', l: 'Activity' }
]

export default function Profile() {
  const { state, patch, openMovie, showSoon } = useStore()

  const avatarBg = state.avatar
    ? `#111 center/cover no-repeat url(${state.avatar})`
    : 'linear-gradient(135deg,var(--fm-accent),var(--fm-accent2))'

  const ratedIds = Object.keys(state.ratings).map(Number)
  const ratingValues = Object.values(state.ratings)
  const avg = ratingValues.length
    ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
    : '0.0'

  const stats = [
    { value: ratedIds.length, label: 'Films rated' },
    { value: state.watchlist.length, label: 'On watchlist' },
    { value: '2024', label: 'Member since' },
    { value: avg, label: 'Avg. rating' }
  ]

  const ids =
    state.profileTab === 'ratings'
      ? ratedIds
      : state.profileTab === 'watchlist'
        ? state.watchlist
        : [...new Set([...state.watchlist, ...ratedIds])]

  const items = [...new Set(ids)].map(getMovie).filter(Boolean)

  return (
    <div style={{ animation: 'fmFade .35s ease' }}>
      <div
        style={{
          height: 210,
          background: 'linear-gradient(120deg,#1a1013,#2c161b 42%,var(--fm-accent))',
          position: 'relative'
        }}
      >
        <div
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,var(--fm-bg),transparent 74%)' }}
        />
      </div>

      <div style={{ maxWidth: 1180, margin: '-72px auto 0', padding: '0 40px 64px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: avatarBg,
              border: '4px solid var(--fm-bg)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 48,
              fontWeight: 900,
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,.34)'
            }}
          >
            {state.avatar ? '' : 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 220, paddingBottom: 8 }}>
            <h1 className="fm-disp" style={{ margin: '0 0 6px', fontSize: 40, lineHeight: 1 }}>
              Alex Rivera
            </h1>
            <p style={{ margin: 0, color: 'var(--fm-muted)', fontWeight: 600, fontSize: 14.5 }}>
              Sci-fi &amp; slow-burn thrillers · Letterboxd refugee · Member since 2024
            </p>
          </div>
          <EditProfileButton onClick={() => showSoon('Editing your profile')} />
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 34, flexWrap: 'wrap' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                minWidth: 130,
                background: 'var(--fm-surface)',
                border: '1px solid var(--fm-border)',
                borderRadius: 18,
                padding: 20
              }}
            >
              <div className="fm-disp" style={{ fontSize: 38, color: 'var(--fm-accent)', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fm-muted)', marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--fm-border)', marginBottom: 26 }}>
          {TABS.map((t) => {
            const active = state.profileTab === t.k
            return (
              <button
                key={t.k}
                onClick={() => patch({ profileTab: t.k })}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  background: 'none',
                  color: active ? 'var(--fm-text)' : 'var(--fm-muted)',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  borderBottom: `2.5px solid ${active ? 'var(--fm-accent)' : 'transparent'}`,
                  marginBottom: -1
                }}
              >
                {t.l}
              </button>
            )
          })}
        </div>

        {items.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(154px,1fr))', gap: 18 }}>
            {items.map((m) => (
              <ProfileTile
                key={m.id}
                movie={m}
                rating={state.ratings[m.id]}
                onClick={() => openMovie(m.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fm-muted)', fontWeight: 600, fontSize: 15 }}>
            Nothing here yet — start rating and saving films.
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileTile({ movie, rating, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div
      {...bind}
      onClick={onClick}
      style={{ cursor: 'pointer', transform: hov ? 'translateY(-6px)' : 'none', transition: 'transform .25s' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 15,
          overflow: 'hidden',
          background: grad(movie.hue),
          boxShadow: '0 10px 24px rgba(0,0,0,.28)'
        }}
      >
        <PosterImage src={movie.posterUrl} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.86) 4%,transparent 54%)'
          }}
        />
        <div style={{ position: 'absolute', bottom: 0, padding: 12 }}>
          {rating ? (
            <div style={{ color: '#ffce54', fontSize: 12, marginBottom: 3, letterSpacing: '1px' }}>
              {'★'.repeat(rating)}
              {'☆'.repeat(5 - rating)}
            </div>
          ) : null}
          <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{movie.title}</div>
        </div>
      </div>
    </div>
  )
}

function EditProfileButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 12,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13.5,
        cursor: 'pointer',
        marginBottom: 8
      }}
    >
      Edit profile <SoonTag />
    </button>
  )
}
