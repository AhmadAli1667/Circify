import { useStore } from '../app/storeContext'
import { Mascot, SoonTag } from '../components/primitives'
import { CHAT_CHIPS, useHover } from '../app/ui'
import ChatMessages from '../components/ChatMessages'

/**
 * Full-page curator.
 *
 * Picks come from a local keyword matcher over the catalogue, not a language
 * model — the badge under the header says as much.
 */
export default function Chat() {
  const { state } = useStore()
  const fresh = state.chatMsgs.length <= 1

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(58% 46% at 50% 34%, var(--fm-accentsoft), transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      {fresh ? <ChatLanding /> : <ChatThread />}
    </div>
  )
}

function ChatLanding() {
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 760,
        margin: '0 auto',
        minHeight: 'calc(100vh - 130px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        animation: 'fmFade .4s ease'
      }}
    >
      <div style={{ marginBottom: 22, animation: 'fmBob 3.4s ease-in-out infinite' }}>
        <Mascot size={76} />
      </div>

      <h1
        style={{
          margin: '0 0 10px',
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: '-.9px',
          textAlign: 'center',
          background: 'linear-gradient(92deg,var(--fm-accent),var(--fm-accent2))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Hi Alex, what should we watch?
      </h1>
      <p
        style={{
          margin: '0 0 10px',
          color: 'var(--fm-muted)',
          fontWeight: 600,
          fontSize: 16,
          textAlign: 'center',
          maxWidth: 460
        }}
      >
        Tell me a vibe, an actor, or the kind of night you want — I know your taste.
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--fm-muted)'
        }}
      >
        Matching on keywords for now · conversational AI <SoonTag />
      </div>

      <div style={{ width: '100%', maxWidth: 620 }}>
        <ChatComposer variant="landing" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
          {CHAT_CHIPS.map((c) => (
            <SuggestionChip key={c} label={c} rounded />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChatThread() {
  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 820,
        margin: '0 auto',
        padding: '22px 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 130px)',
        animation: 'fmFade .35s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <Mascot size={48} />
        <div style={{ flex: 1 }}>
          <h1 className="fm-disp" style={{ margin: 0, fontSize: 30, lineHeight: 1 }}>
            Flixmate
          </h1>
          <div
            style={{
              fontSize: 13,
              color: 'var(--fm-accent)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fm-accent)' }} />
            Your film matchmaker · tuned to your taste
          </div>
        </div>
      </div>

      <div
        className="fm-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <ChatMessages />
      </div>

      <div style={{ paddingTop: 14, borderTop: '1px solid var(--fm-border)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {CHAT_CHIPS.map((c) => (
            <SuggestionChip key={c} label={c} />
          ))}
        </div>
        <ChatComposer />
      </div>
    </div>
  )
}

export function SuggestionChip({ label, rounded, compact }) {
  const { doChat } = useStore()
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={() => doChat(label)}
      style={{
        flex: 'none',
        padding: rounded ? '9px 16px' : compact ? '7px 12px' : '8px 14px',
        borderRadius: rounded ? 22 : compact ? 11 : 12,
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: compact ? 'var(--fm-input)' : 'var(--fm-surface)',
        color: hov ? 'var(--fm-accent)' : 'var(--fm-muted)',
        fontWeight: 700,
        fontSize: compact ? 12 : 13,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all .2s'
      }}
    >
      {label}
    </button>
  )
}

/** Input + send button. `landing` is the tall pill on the empty state. */
export function ChatComposer({ variant, compact }) {
  const { state, patch, doChat } = useStore()

  const send = () => {
    const t = state.chatInput.trim()
    if (t) doChat(t)
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  if (variant === 'landing') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 8px 8px 20px',
          border: '1px solid var(--fm-border)',
          background: 'var(--fm-elev)',
          borderRadius: 32,
          boxShadow: '0 14px 40px rgba(0,0,0,.3)'
        }}
      >
        <span style={{ color: 'var(--fm-muted)', fontSize: 22, flex: 'none', fontWeight: 400 }}>＋</span>
        <input
          value={state.chatInput}
          onChange={(e) => patch({ chatInput: e.target.value })}
          onKeyDown={onKeyDown}
          placeholder="Ask Flixmate…"
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            color: 'var(--fm-text)',
            fontSize: 16,
            fontWeight: 600,
            outline: 'none',
            padding: '13px 0'
          }}
        />
        <SendButton onClick={send} size={48} radius="50%" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: compact ? 9 : 10, alignItems: 'center' }}>
      <input
        value={state.chatInput}
        onChange={(e) => patch({ chatInput: e.target.value })}
        onKeyDown={onKeyDown}
        placeholder={compact ? 'Describe a vibe…' : 'Describe the vibe you’re after…'}
        style={{
          flex: 1,
          padding: compact ? '12px 15px' : '14px 18px',
          border: '1px solid var(--fm-border)',
          background: 'var(--fm-input)',
          borderRadius: compact ? 13 : 14,
          color: 'var(--fm-text)',
          fontSize: compact ? 14 : 15,
          fontWeight: 600,
          outline: 'none'
        }}
      />
      <SendButton onClick={send} size={compact ? 44 : 50} radius={compact ? 13 : 14} />
    </div>
  )
}

function SendButton({ onClick, size, radius }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label="Send"
      style={{
        width: size,
        height: size,
        flex: 'none',
        border: 'none',
        borderRadius: radius,
        background: 'var(--fm-accent)',
        color: '#fff',
        fontSize: 18,
        cursor: 'pointer',
        boxShadow: '0 4px 16px var(--fm-accentglow)',
        transform: hov ? 'scale(1.06)' : 'none',
        transition: 'transform .2s'
      }}
    >
      ➤
    </button>
  )
}
