import { useStore } from '../app/storeContext'
import { getMovie } from '../app/catalog'
import PosterCard from '../components/PosterCard'
import { RESULT_GRID, useHover } from '../app/ui'

export default function Watchlist() {
  const { state, patch, nav } = useStore()
  const saved = state.watchlist.map(getMovie).filter(Boolean)

  return (
    <div style={{ padding: '34px 40px 64px', maxWidth: 1440, margin: '0 auto', animation: 'fmFade .35s ease' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h1 className="fm-disp" style={{ margin: '0 0 6px', fontSize: 46, lineHeight: 1 }}>
            My Watchlist
          </h1>
          <p style={{ margin: 0, color: 'var(--fm-muted)', fontWeight: 600, fontSize: 15 }}>
            {saved.length} saved · sorted by date added
          </p>
        </div>
        <ShareListButton onClick={() => patch({ shareOpen: true })} />
      </div>

      {saved.length ? (
        <div style={RESULT_GRID}>
          {saved.map((m) => (
            <PosterCard key={m.id} movie={m} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '76px 20px',
            background: 'var(--fm-surface)',
            border: '1px dashed var(--fm-border)',
            borderRadius: 22
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: 'var(--fm-accentsoft)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 18px',
              color: 'var(--fm-accent)'
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h12v16l-6-4-6 4z" />
            </svg>
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Your watchlist is empty</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fm-muted)', marginBottom: 22 }}>
            Tap the ＋ on any poster to save it for later.
          </div>
          <button
            onClick={() => nav('home')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 12,
              background: 'var(--fm-accent)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Browse films
          </button>
        </div>
      )}
    </div>
  )
}

function ShareListButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 18px',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 12,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13.5,
        cursor: 'pointer'
      }}
    >
      ↗ Share list
    </button>
  )
}
