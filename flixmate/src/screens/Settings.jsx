import { useStore } from '../app/storeContext'
import { SoonTag } from '../components/primitives'

/**
 * Settings.
 *
 * Toggles flip locally and persist to this device. Anything that needs a
 * server — email changes, password, account deletion, account linking,
 * cross-device sync — is labelled rather than faked.
 */
export default function Settings() {
  const { state, patch, showSoon } = useStore()

  const avatarBg = state.avatar
    ? `#111 center/cover no-repeat url(${state.avatar})`
    : 'linear-gradient(135deg,var(--fm-accent),var(--fm-accent2))'

  const toggle = (k) => () => patch((s) => ({ toggles: { ...s.toggles, [k]: !s.toggles[k] } }))

  const sections = [
    {
      title: 'Account',
      note: 'Managed on the server — coming soon',
      rows: [
        { label: 'Email', sub: 'alex@flixmate.app', btn: 'Change', soon: true },
        { label: 'Password', sub: 'Last changed 3 months ago', btn: 'Update', soon: true }
      ]
    },
    {
      title: 'Notifications',
      note: 'Saved on this device · delivery coming soon',
      rows: [
        { label: 'Recommendation alerts', sub: 'New picks tuned to your taste', key: 'notif' },
        { label: 'New releases', sub: 'When films on your list hit theatres', key: 'newRel' },
        { label: 'Friend activity', sub: 'When friends rate or share', key: 'friends' }
      ]
    },
    {
      title: 'Privacy',
      rows: [{ label: 'Private watchlist', sub: 'Only you can see your saved films', key: 'privacy' }]
    },
    {
      title: 'Connected accounts',
      note: 'OAuth linking — coming soon',
      rows: [{ label: 'Google', sub: 'alex@gmail.com', key: 'google' }]
    },
    {
      title: 'Danger zone',
      rows: [{ label: 'Delete account', sub: 'Permanently remove your data', btn: 'Delete', danger: true, soon: true }]
    }
  ]

  return (
    <div style={{ padding: '34px 40px 64px', maxWidth: 760, margin: '0 auto', animation: 'fmFade .35s ease' }}>
      <h1 className="fm-disp" style={{ margin: '0 0 24px', fontSize: 44, lineHeight: 1 }}>
        Settings
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: 'var(--fm-surface)',
          border: '1px solid var(--fm-border)',
          borderRadius: 18,
          padding: '18px 20px',
          marginBottom: 28,
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: avatarBg,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 26,
            flex: 'none'
          }}
        >
          {state.avatar ? '' : 'A'}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Profile photo</div>
          <div style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 600 }}>
            PNG or JPG — stored on this device
          </div>
        </div>
        <label
          style={{
            padding: '9px 16px',
            borderRadius: 11,
            border: '1px solid var(--fm-accent)',
            background: 'var(--fm-accentsoft)',
            color: 'var(--fm-accent)',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            flex: 'none'
          }}
        >
          Upload
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const reader = new FileReader()
              reader.onload = () => patch({ avatar: reader.result })
              reader.readAsDataURL(f)
            }}
            style={{ display: 'none' }}
          />
        </label>
        {state.avatar && (
          <button
            onClick={() => patch({ avatar: null })}
            style={{
              padding: '9px 14px',
              borderRadius: 11,
              border: '1px solid var(--fm-border)',
              background: 'transparent',
              color: 'var(--fm-muted)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              flex: 'none'
            }}
          >
            Remove
          </button>
        )}
      </div>

      {sections.map((sec) => (
        <section key={sec.title} style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '.9px',
                color: 'var(--fm-muted)'
              }}
            >
              {sec.title}
            </span>
            {sec.note && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fm-accent)' }}>· {sec.note}</span>
            )}
          </div>

          <div
            style={{
              background: 'var(--fm-surface)',
              border: '1px solid var(--fm-border)',
              borderRadius: 18,
              overflow: 'hidden'
            }}
          >
            {sec.rows.map((r, i) => (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: i === sec.rows.length - 1 ? 'none' : '1px solid var(--fm-border)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: r.danger ? '#ff6b6b' : 'var(--fm-text)' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--fm-muted)', fontWeight: 600, marginTop: 2 }}>
                    {r.sub}
                  </div>
                </div>

                {r.key ? (
                  <Switch on={state.toggles[r.key]} onClick={toggle(r.key)} />
                ) : (
                  <button
                    onClick={() => showSoon(`${r.label} — ${r.btn.toLowerCase()}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '8px 15px',
                      borderRadius: 10,
                      border: `1px solid ${r.danger ? '#ff6b6b' : 'var(--fm-border)'}`,
                      background: 'transparent',
                      color: r.danger ? '#ff6b6b' : 'var(--fm-text)',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      flex: 'none'
                    }}
                  >
                    {r.btn}
                    {r.soon && <SoonTag />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Switch({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        width: 44,
        height: 26,
        borderRadius: 14,
        border: 'none',
        background: on ? 'var(--fm-accent)' : 'var(--fm-border)',
        position: 'relative',
        cursor: 'pointer',
        flex: 'none',
        transition: 'background .2s'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .2s'
        }}
      />
    </button>
  )
}
