import { useStore } from '../app/storeContext'
import { Mascot } from './primitives'
import { CHAT_CHIPS, useHover } from '../app/ui'
import ChatMessages from './ChatMessages'
import { ChatComposer, SuggestionChip } from '../screens/Chat'

/**
 * The floating mascot in the bottom-right corner and the compact chat panel it
 * opens. Hidden on the full-page chat screen, which owns the conversation.
 */
export default function ChatWidget() {
  const { state, patch } = useStore()

  if (state.screen === 'chat') return null

  return state.chat === 'open' ? <Panel /> : <Bubble onClick={() => patch({ chat: 'open' })} />
}

function Bubble({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 26,
        bottom: 26,
        zIndex: 70,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 11,
        cursor: 'pointer',
        animation: 'fmPop .4s ease'
      }}
    >
      <div
        style={{
          background: 'var(--fm-elev)',
          border: '1px solid var(--fm-border)',
          borderRadius: '16px 16px 4px 16px',
          padding: '11px 15px',
          boxShadow: '0 12px 34px rgba(0,0,0,.35)',
          maxWidth: 190
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.35 }}>
          <b>
            <i>HEY THERE!</i>
          </b>
        </div>
      </div>
      <div style={{ animation: 'fmBob 3s ease-in-out infinite' }}>
        <Mascot size={50} />
      </div>
    </div>
  )
}

function Panel() {
  const { patch, nav } = useStore()

  return (
    <div
      style={{
        position: 'fixed',
        right: 26,
        bottom: 26,
        zIndex: 70,
        width: 370,
        maxWidth: 'calc(100vw - 40px)',
        height: 520,
        maxHeight: 'calc(100vh - 100px)',
        background: 'var(--fm-surface)',
        border: '1px solid var(--fm-border)',
        borderRadius: 22,
        boxShadow: '0 30px 80px rgba(0,0,0,.55)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fmPop .3s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 18px',
          borderBottom: '1px solid var(--fm-border)',
          background: 'var(--fm-elev)'
        }}
      >
        <Mascot size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>Flixmate</div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--fm-accent)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fm-accent)' }} />
            Your film matchmaker
          </div>
        </div>
        <IconButton label="Open full screen" glyph="⤢" onClick={() => nav('chat')} />
        <IconButton label="Close" glyph="✕" onClick={() => patch({ chat: 'closed' })} />
      </div>

      <div
        className="fm-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <ChatMessages compact />
      </div>

      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--fm-border)' }}>
        <div
          className="fm-scroll"
          style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 10, paddingBottom: 2 }}
        >
          {CHAT_CHIPS.map((c) => (
            <SuggestionChip key={c} label={c} compact />
          ))}
        </div>
        <ChatComposer compact />
      </div>
    </div>
  )
}

function IconButton({ label, glyph, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        border: 'none',
        background: hov ? 'var(--fm-hover)' : 'var(--fm-input)',
        color: 'var(--fm-text)',
        fontSize: 15,
        cursor: 'pointer',
        flex: 'none'
      }}
    >
      {glyph}
    </button>
  )
}
