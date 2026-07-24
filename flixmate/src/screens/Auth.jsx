import { useState } from 'react'
import { useStore } from '../app/storeContext'
import { Logo, SoonTag } from '../components/primitives'
import { useHover } from '../app/ui'

/**
 * Sign in / sign up.
 *
 * There is no auth backend, so nothing here creates or verifies an account —
 * submitting drops you into the app as the demo profile and the notice below
 * the form says so. Password strength is measured locally.
 */
export default function Auth() {
  const { state, patch, nav, showSoon } = useStore()
  const isSignup = state.authMode === 'signup'

  const len = state.pw.length
  const strength = len === 0 ? 0 : len < 6 ? 1 : len < 10 ? 2 : 3
  const strengthColour = ['var(--fm-muted)', '#ff5b52', '#ffb020', '#4ade80'][strength]
  const strengthLabel =
    len === 0 ? 'Use 10+ characters for a strong password' : ['', 'Weak', 'Fair', 'Strong'][strength]

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 71px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(circle at 50% -10%,var(--fm-accentsoft),transparent 55%)',
        animation: 'fmFade .35s ease'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--fm-surface)',
          border: '1px solid var(--fm-border)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 26px 64px rgba(0,0,0,.3)',
          animation: 'fmPop .35s ease'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Logo size={52} />
          </div>
          <h1 className="fm-disp" style={{ margin: '0 0 6px', fontSize: 32, lineHeight: 1 }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ margin: 0, color: 'var(--fm-muted)', fontWeight: 600, fontSize: 14 }}>
            {isSignup ? 'Start tracking everything you watch' : 'Sign in to sync your watchlist'}
          </p>
        </div>

        <GoogleButton onClick={() => showSoon('Google sign-in')} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--fm-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--fm-muted)', fontWeight: 700 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--fm-border)' }} />
        </div>

        {isSignup && <Field placeholder="Display name" />}
        <Field placeholder="Email address" type="email" />
        <Field
          placeholder="Password"
          type="password"
          value={state.pw}
          onChange={(e) => patch({ pw: e.target.value })}
        />

        {isSignup && (
          <>
            <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 3,
                    background:
                      i < strength ? ['#ff5b52', '#ffb020', '#4ade80'][Math.min(strength - 1, 2)] : 'var(--fm-border)'
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: strengthColour, marginBottom: 14 }}>
              {strengthLabel}
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 9,
                fontSize: 12.5,
                color: 'var(--fm-muted)',
                fontWeight: 600,
                marginBottom: 16,
                cursor: 'pointer',
                lineHeight: 1.4
              }}
            >
              <input type="checkbox" style={{ marginTop: 2, accentColor: 'var(--fm-accent)' }} /> I agree to the{' '}
              <button type="button" onClick={() => showSoon('Terms')} style={linkBtn}>
                Terms
              </button>{' '}
              &amp;{' '}
              <button type="button" onClick={() => showSoon('Privacy Policy')} style={linkBtn}>
                Privacy Policy
              </button>
            </label>
          </>
        )}

        {!isSignup && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--fm-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <input type="checkbox" style={{ accentColor: 'var(--fm-accent)' }} /> Remember me
            </label>
            <button onClick={() => showSoon('Password reset')} style={{ ...linkBtn, fontSize: 13, fontWeight: 800 }}>
              Forgot password?
            </button>
          </div>
        )}

        <SubmitButton label={isSignup ? 'Create account' : 'Sign in'} onClick={() => nav('home')} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--fm-muted)',
            textAlign: 'center'
          }}
        >
          Real accounts &amp; sync <SoonTag /> — this continues as the demo profile
        </div>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--fm-muted)', fontWeight: 700 }}>
          {isSignup ? 'Already have an account?' : 'New to Flixmate?'}{' '}
          <button
            onClick={() => patch({ authMode: isSignup ? 'login' : 'signup', pw: '' })}
            style={{ ...linkBtn, fontWeight: 800 }}
          >
            {isSignup ? 'Sign in' : 'Create one'}
          </button>
        </div>
      </div>
    </div>
  )
}

const linkBtn = {
  border: 'none',
  background: 'none',
  padding: 0,
  color: 'var(--fm-accent)',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 'inherit',
  fontFamily: 'inherit'
}

function Field({ placeholder, type = 'text', value, onChange }) {
  const [focus, setFocus] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '13px 15px',
        border: `1px solid ${focus ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 13,
        color: 'var(--fm-text)',
        fontSize: 14,
        fontWeight: 600,
        outline: 'none',
        marginBottom: 12
      }}
    />
  )
}

function GoogleButton({ onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 13,
        border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
        background: 'var(--fm-input)',
        borderRadius: 13,
        color: 'var(--fm-text)',
        fontWeight: 800,
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: 16
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z" />
        <path
          fill="#EA4335"
          d="M12 4.75c1.61 0 3.06.55 4.2 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"
        />
      </svg>
      Continue with Google
      <SoonTag />
    </button>
  )
}

function SubmitButton({ label, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        width: '100%',
        padding: 14,
        border: 'none',
        borderRadius: 14,
        background: 'var(--fm-accent)',
        color: '#fff',
        fontWeight: 900,
        fontSize: 15,
        cursor: 'pointer',
        boxShadow: '0 6px 20px var(--fm-accentglow)',
        transform: hov ? 'translateY(-1px)' : 'none',
        transition: 'transform .2s',
        marginBottom: 14
      }}
    >
      {label}
    </button>
  )
}
