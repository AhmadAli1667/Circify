import { useStore } from '../app/storeContext'
import { Logo } from './primitives'
import { useHover } from '../app/ui'

const SOCIALS = [
  { name: 'X', glyph: '𝕏' },
  { name: 'Instagram', glyph: '◎' },
  { name: 'YouTube', glyph: '▶' },
  { name: 'TikTok', glyph: '♪' }
]

/** Footer links that map onto a real screen; everything else reports "soon". */
const ROUTES = {
  Discover: 'home',
  'In Theatres': 'theatres',
  'For You': 'foryou',
  'AI Curator': 'chat'
}

const COLUMNS = [
  { title: 'Product', links: ['Discover', 'In Theatres', 'For You', 'AI Curator'] },
  { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Contact'] }
]

export default function Footer() {
  const { state, patch, nav, showSoon } = useStore()

  return (
    <footer style={{ marginTop: 64, padding: '48px 0 40px', borderTop: '1px solid var(--fm-border)' }}>
      <div
        style={{
          display: 'flex',
          gap: 48,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 40
        }}
      >
        <div style={{ maxWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={30} />
            <span style={{ fontWeight: 900, fontSize: 18 }}>
              Flix<span style={{ color: 'var(--fm-accent)' }}>mate</span>
            </span>
          </div>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: 'var(--fm-muted)',
              fontWeight: 600
            }}
          >
            Your personal film discovery companion. Track what you watch, find what&apos;s next, share it with the
            people you love.
          </p>
          <div style={{ display: 'flex', gap: 9 }}>
            {SOCIALS.map((s) => (
              <SocialLink key={s.name} social={s} onClick={() => showSoon(`${s.name} page`)} />
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '.9px',
                color: 'var(--fm-muted)',
                marginBottom: 14
              }}
            >
              {col.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <FooterLink key={l} label={l} onClick={() => (ROUTES[l] ? nav(ROUTES[l]) : showSoon(l))} />
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            width: 300,
            background: 'var(--fm-elev)',
            border: '1px solid var(--fm-border)',
            borderRadius: 18,
            padding: 22
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 5 }}>Got feedback?</div>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fm-muted)', fontWeight: 600 }}>
            Tell us what to build next, we read every note.
          </p>
          {state.feedbackSent ? (
            <div
              style={{
                padding: 16,
                textAlign: 'center',
                background: 'var(--fm-accentsoft)',
                borderRadius: 12,
                color: 'var(--fm-accent)',
                fontWeight: 800,
                fontSize: 13.5
              }}
            >
              ✓ Saved on this device — delivery coming soon
            </div>
          ) : (
            <>
              <textarea
                value={state.feedbackText}
                onChange={(e) => patch({ feedbackText: e.target.value })}
                placeholder="Your idea, bug, or love note…"
                style={{
                  width: '100%',
                  minHeight: 74,
                  resize: 'none',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--fm-border)',
                  background: 'var(--fm-input)',
                  color: 'var(--fm-text)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  outline: 'none',
                  marginBottom: 10
                }}
              />
              <button
                onClick={() => {
                  if (!state.feedbackText.trim()) return
                  patch({ feedbackSent: true })
                  showSoon('Feedback delivery')
                }}
                style={{
                  width: '100%',
                  padding: 11,
                  border: 'none',
                  borderRadius: 11,
                  background: 'var(--fm-accent)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: 'pointer'
                }}
              >
                Send feedback
              </button>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 22,
          borderTop: '1px solid var(--fm-border)'
        }}
      >
        <span style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 700 }}>
          © 2026 Flixmate · Crafted by <span style={{ color: 'var(--fm-accent)' }}>&nbsp;Ahmad Ali</span>
        </span>
        <span style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 600 }}>
          Ratings and cast from the local catalogue · streaming and social data are illustrative
        </span>
      </div>
    </footer>
  )
}

function SocialLink({ social, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      title={social.name}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'transparent',
        display: 'grid',
        placeItems: 'center',
        color: hov ? 'var(--fm-accent)' : 'var(--fm-muted)',
        cursor: 'pointer',
        transition: 'all .2s'
      }}
    >
      {social.glyph}
    </button>
  )
}

function FooterLink({ label, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        border: 'none',
        background: 'none',
        padding: 0,
        textAlign: 'left',
        fontSize: 13.5,
        fontWeight: 700,
        color: hov ? 'var(--fm-accent)' : 'var(--fm-text)',
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  )
}
