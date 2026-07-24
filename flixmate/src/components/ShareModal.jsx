import { useState } from 'react'
import { useStore } from '../app/storeContext'
import { SoonTag } from './primitives'
import { useHover } from '../app/ui'

const SHARE_URL = 'flixmate.app/u/alex'
const TARGETS = ['Copy DM', 'Email', 'X', 'More']

/**
 * Share sheet. Copying the link works via the clipboard API; the per-network
 * targets need real share endpoints and report themselves as unavailable.
 */
export default function ShareModal() {
  const { state, patch, showSoon } = useStore()
  const [copied, setCopied] = useState(false)

  if (!state.shareOpen) return null
  const close = () => patch({ shareOpen: false })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${SHARE_URL}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      showSoon('Copying to clipboard')
    }
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(0,0,0,.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fmFade .2s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--fm-surface)',
          border: '1px solid var(--fm-border)',
          borderRadius: 22,
          padding: 28,
          boxShadow: '0 30px 70px rgba(0,0,0,.5)',
          animation: 'fmPop .25s ease'
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Share Flixmate</div>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 600 }}>
          Send your profile or a list to a friend.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <input
            value={SHARE_URL}
            readOnly
            style={{
              flex: 1,
              padding: '11px 14px',
              border: '1px solid var(--fm-border)',
              background: 'var(--fm-input)',
              borderRadius: 11,
              color: 'var(--fm-text)',
              fontSize: 13,
              fontWeight: 700,
              outline: 'none'
            }}
          />
          <button
            onClick={copy}
            style={{
              padding: '11px 16px',
              border: 'none',
              borderRadius: 11,
              background: 'var(--fm-accent)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              flex: 'none'
            }}
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {TARGETS.map((t) => (
            <TargetButton key={t} label={t} onClick={() => showSoon(`Sharing via ${t}`)} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--fm-muted)'
          }}
        >
          Public profile pages <SoonTag />
        </div>
      </div>
    </div>
  )
}

function TargetButton({ label, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 0',
        borderRadius: 12,
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'border .2s'
      }}
    >
      {label}
    </button>
  )
}
