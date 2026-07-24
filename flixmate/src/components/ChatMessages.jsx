import { useStore } from '../app/storeContext'
import { grad } from '../app/art'
import { useHover } from '../app/ui'

/** Message list shared by the floating chat widget and the full-page screen. */
export default function ChatMessages({ compact }) {
  const { state } = useStore()

  return (
    <>
      {state.chatMsgs.map((msg, i) => (
        <div key={i} style={{ display: 'contents' }}>
          <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: compact ? '82%' : '76%',
                padding: compact ? '11px 14px' : '13px 17px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--fm-accent)' : 'var(--fm-input)',
                color: msg.role === 'user' ? '#fff' : 'var(--fm-text)',
                fontSize: compact ? 14 : 15,
                fontWeight: 600,
                lineHeight: compact ? 1.5 : 1.55
              }}
            >
              {msg.text}
            </div>
          </div>

          {msg.movies?.length > 0 && (
            <div
              style={
                compact
                  ? { display: 'flex', flexDirection: 'column', gap: 9 }
                  : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: '88%' }
              }
            >
              {msg.movies.map((m) => (
                <PickCard key={m.id} pick={m} compact={compact} />
              ))}
            </div>
          )}
        </div>
      ))}

      {state.chatTyping && (
        <div
          style={{
            display: 'flex',
            gap: compact ? 4 : 5,
            padding: compact ? '12px 14px' : '14px 16px',
            background: 'var(--fm-input)',
            borderRadius: compact ? 14 : 16,
            width: 'fit-content'
          }}
        >
          {[0, 0.2, 0.4].map((delay) => (
            <span
              key={delay}
              style={{
                width: compact ? 7 : 8,
                height: compact ? 7 : 8,
                borderRadius: '50%',
                background: 'var(--fm-muted)',
                animation: `fmDots 1.2s ${delay}s infinite`
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

function PickCard({ pick, compact }) {
  const { openMovie } = useStore()
  const [hov, bind] = useHover()

  return (
    <div
      {...bind}
      onClick={() => openMovie(pick.id)}
      style={{
        display: 'flex',
        gap: compact ? 11 : 12,
        padding: compact ? 9 : 11,
        background: 'var(--fm-elev)',
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        borderRadius: compact ? 13 : 14,
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      <div
        style={{
          width: compact ? 44 : 48,
          height: compact ? 64 : 70,
          flex: 'none',
          borderRadius: compact ? 8 : 9,
          background: grad(pick.hue)
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: compact ? 13.5 : 14, marginBottom: compact ? 2 : 3 }}>
          {pick.title}{' '}
          <span style={{ color: 'var(--fm-muted)', fontWeight: 600, fontSize: compact ? 11.5 : 12 }}>
            {pick.year}
          </span>
        </div>
        <div
          style={{
            fontSize: compact ? 11.5 : 12,
            color: 'var(--fm-muted)',
            fontWeight: 600,
            lineHeight: compact ? 1.4 : 1.45
          }}
        >
          {pick.why}
        </div>
      </div>
    </div>
  )
}
