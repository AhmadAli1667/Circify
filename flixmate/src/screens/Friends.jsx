import { useMemo } from 'react'
import { useStore } from '../app/storeContext'
import { movies as MOVIES } from '../app/catalog'
import { grad } from '../app/art'
import PosterImage from '../components/PosterImage'
import { BackButton, SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * Friends.
 *
 * There is no accounts or social backend, so the people and their activity are
 * sample data. The banner at the top says so rather than implying it's live.
 */
const FRIENDS = [
  ['Sam Ortega', 18],
  ['Priya Nair', 150],
  ['Devon Clarke', 280],
  ['Mara Löfgren', 210],
  ['Theo Bianchi', 95]
]

const ACTIONS = [
  ['rated', ' — loved it', '★★★★½'],
  ['added', ' to their watchlist', ''],
  ['reviewed', '', '★★★★'],
  ['rated', '', '★★★½'],
  ['added', ' to “Sunday picks”', '']
]

const TIMES = ['2h ago', '5h ago', 'yesterday', '2 days ago', '3 days ago']

export default function Friends() {
  const { state, patch, nav, openMovie } = useStore()

  const watching = useMemo(
    () => FRIENDS.map((f, i) => ({ friend: f, movie: MOVIES[(i * 7 + 1) % MOVIES.length] })),
    []
  )
  const activity = useMemo(
    () => FRIENDS.map((f, i) => ({ friend: f, movie: MOVIES[(i * 13 + 2) % MOVIES.length], action: ACTIONS[i % 5] })),
    []
  )

  return (
    <div style={{ padding: '34px 40px 64px', maxWidth: 1180, margin: '0 auto', animation: 'fmFade .35s ease' }}>
      <BackButton onClick={() => nav('home')} style={{ marginBottom: 16 }} />

      <h1 className="fm-disp" style={{ margin: '0 0 8px', fontSize: 46, lineHeight: 1 }}>
        Your Friends
      </h1>
      <p style={{ margin: '0 0 20px', color: 'var(--fm-muted)', fontWeight: 600, fontSize: 15 }}>
        See what the people you follow are watching, rating, and loving.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderRadius: 14,
          background: 'var(--fm-accentsoft)',
          border: '1px solid var(--fm-accent)',
          marginBottom: 32
        }}
      >
        <span style={{ color: 'var(--fm-accent)', fontSize: 18 }}>✦</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--fm-accent)' }}>
            Following real people — coming soon
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fm-muted)' }}>
            Accounts and the social graph aren&apos;t wired up yet. The feed below is a preview with sample people.
          </div>
        </div>
        <SoonTag />
      </div>

      <SectionLabel>What your friends are watching</SectionLabel>
      <div
        className="fm-scroll"
        style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '2px 2px 16px', marginBottom: 38 }}
      >
        {watching.map(({ friend, movie }) => (
          <WatchingCard key={friend[0]} friend={friend} movie={movie} onClick={() => openMovie(movie.id)} />
        ))}
      </div>

      <SectionLabel>Recent activity</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activity.map(({ friend, movie, action }, i) => {
          const liked = Boolean(state.actLiked[i])
          return (
            <div
              key={friend[0]}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--fm-surface)',
                border: '1px solid var(--fm-border)',
                borderRadius: 16,
                flexWrap: 'wrap'
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: grad(friend[1]),
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  color: '#fff',
                  fontSize: 16,
                  flex: 'none'
                }}
              >
                {friend[0]
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fm-text)', lineHeight: 1.4 }}>
                  <b style={{ fontWeight: 900 }}>{friend[0]}</b> {action[0]}{' '}
                  <b
                    onClick={() => openMovie(movie.id)}
                    style={{ fontWeight: 900, color: 'var(--fm-accent)', cursor: 'pointer' }}
                  >
                    {movie.title}
                  </b>
                  {action[1]}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fm-muted)', fontWeight: 600, marginTop: 2 }}>
                  {TIMES[i % TIMES.length]}
                </div>
              </div>
              <span style={{ color: '#ffce54', fontWeight: 800, fontSize: 13, flex: 'none' }}>{action[2]}</span>
              <LikeButton
                liked={liked}
                count={4 + i * 3 + (liked ? 1 : 0)}
                onClick={() => patch((s) => ({ actLiked: { ...s.actLiked, [i]: !s.actLiked[i] } }))}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontWeight: 800,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '.8px',
        color: 'var(--fm-muted)',
        marginBottom: 16
      }}
    >
      {children}
    </div>
  )
}

function WatchingCard({ friend, movie, onClick }) {
  const [hov, bind] = useHover()
  return (
    <div onClick={onClick} style={{ flex: 'none', width: 152, cursor: 'pointer' }}>
      <div
        {...bind}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2/3',
          borderRadius: 14,
          overflow: 'hidden',
          background: grad(movie.hue),
          boxShadow: '0 10px 24px rgba(0,0,0,.28)',
          transform: hov ? 'translateY(-6px)' : 'none',
          transition: 'transform .25s'
        }}
      >
        <PosterImage src={movie.posterUrl} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg,rgba(0,0,0,.82) 4%,transparent 52%)'
          }}
        />
        <div style={{ position: 'absolute', bottom: 0, padding: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ color: '#ffce54', fontSize: 11 }}>★</span>
            <span style={{ fontWeight: 800, fontSize: 11.5, color: '#fff' }}>{movie.rating}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', lineHeight: 1.15 }}>{movie.title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9 }}>
        <span
          style={{
            width: 22,
            height: 22,
            flex: 'none',
            borderRadius: '50%',
            background: grad(friend[1]),
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 10
          }}
        >
          {friend[0][0]}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fm-muted)' }}>
          {friend[0].split(' ')[0]} is watching
        </span>
      </div>
    </div>
  )
}

function LikeButton({ liked, count, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'transparent',
        borderRadius: 11,
        color: liked ? 'var(--fm-accent)' : 'var(--fm-muted)',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        flex: 'none',
        transition: 'all .2s'
      }}
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  )
}
