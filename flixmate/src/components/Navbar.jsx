import { useState } from 'react'
import { useStore } from '../app/storeContext'
import { PRESET_LIST } from '../app/theme'
import { SERIES_AVAILABLE } from '../app/catalog'
import { Logo, SearchIcon, SoonTag } from './primitives'
import { pill, useHover } from '../app/ui'

const NAV_ITEMS = [
  { k: 'theatres', l: 'In Theatres' },
  { k: 'foryou', l: 'For You' },
  { k: 'friends', l: 'Friends' }
]

const MENU_LINKS = [
  { icon: '✦', label: 'Find your next watch', to: 'chat' },
  { icon: '☰', label: 'Watchlist', to: 'watchlist' },
  { icon: '✦', label: 'For You', to: 'foryou' },
  { icon: '★', label: 'My Ratings', to: 'profile', extra: { profileTab: 'ratings' } },
  { icon: '⚙', label: 'Settings', to: 'settings' }
]

export default function Navbar() {
  const { state, nav } = useStore()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '14px 32px',
        background: 'var(--fm-navbg)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid var(--fm-border)',
        flexWrap: 'wrap'
      }}
    >
      <div
        onClick={() => nav('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', flex: 'none' }}
      >
        <Logo />
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-.6px' }}>
          Flix<span style={{ color: 'var(--fm-accent)' }}>mate</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 'none' }}>
        {NAV_ITEMS.map((n) => (
          <NavLink key={n.k} item={n} active={state.screen === n.k} onClick={() => nav(n.k)} />
        ))}
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: 560,
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          minWidth: 250
        }}
      >
        <SearchField />
        <FilterPopover />
      </div>

      <AvatarMenu />
    </nav>
  )
}

function NavLink({ item, active, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        padding: '8px 13px',
        border: 'none',
        background: 'none',
        color: active || hov ? 'var(--fm-text)' : 'var(--fm-muted)',
        fontWeight: active ? 900 : 700,
        fontSize: 14,
        borderRadius: 9,
        cursor: 'pointer',
        transition: 'color .2s',
        position: 'relative'
      }}
    >
      {item.l}
      <span
        style={{
          position: 'absolute',
          left: 13,
          right: 13,
          bottom: 2,
          height: 2,
          borderRadius: 2,
          background: active ? 'var(--fm-accent)' : 'transparent'
        }}
      />
    </button>
  )
}

function SearchField() {
  const { state, patch, nav } = useStore()
  const [focus, setFocus] = useState(false)

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: 15,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--fm-muted)',
          pointerEvents: 'none',
          display: 'flex'
        }}
      >
        <SearchIcon />
      </div>
      <input
        value={state.query}
        onChange={(e) => patch({ query: e.target.value, screen: 'search', mood: null })}
        onFocus={() => {
          setFocus(true)
          if (state.screen !== 'search' && state.screen !== 'home') nav('search')
        }}
        onBlur={() => setFocus(false)}
        placeholder="Search films, directors, actors…"
        style={{
          width: '100%',
          padding: '11px 16px 11px 42px',
          background: 'var(--fm-input)',
          border: `1px solid ${focus ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
          borderRadius: 13,
          color: 'var(--fm-text)',
          fontSize: 14,
          fontWeight: 600,
          outline: 'none',
          transition: 'border .2s'
        }}
      />
    </div>
  )
}

function FilterPopover() {
  const { state, patch, setType, genres } = useStore()
  const open = state.filterOpen

  const typeFilters = [
    { k: 'all', l: 'All' },
    { k: 'movie', l: 'Films' },
    { k: 'series', l: 'Series' }
  ]
  const sortOptions = [
    { k: 'rating', l: 'Top rated' },
    { k: 'year', l: 'Newest' },
    { k: 'title', l: 'A–Z' }
  ]
  const ratingTiers = [
    { k: 0, l: 'Any' },
    { k: 7, l: '7+' },
    { k: 8, l: '8+' },
    { k: 9, l: '9+' }
  ]

  return (
    <div data-fm-pop style={{ position: 'relative', flex: 'none' }}>
      <button
        onClick={() => patch((s) => ({ filterOpen: !s.filterOpen, menuOpen: false }))}
        title="Filter & sort"
        style={{
          width: 44,
          height: 44,
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${open ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
          background: open ? 'var(--fm-accent)' : 'var(--fm-input)',
          borderRadius: 13,
          cursor: 'pointer',
          color: open ? '#fff' : 'var(--fm-text)',
          transition: 'all .2s'
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 4v6M6 14v6M12 4v10M12 18v2M18 4v2M18 10v10" />
          <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" />
          <circle cx="18" cy="8" r="2" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {open && (
        <div
          className="fm-scroll"
          style={{
            position: 'absolute',
            top: 54,
            right: 0,
            width: 340,
            maxHeight: '76vh',
            overflowY: 'auto',
            background: 'var(--fm-elev)',
            border: '1px solid var(--fm-border)',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            zIndex: 60,
            animation: 'fmPop .2s ease'
          }}
        >
          <SectionLabel>Show</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {typeFilters.map((t) => (
              <ChipButton
                key={t.k}
                grow
                active={state.type === t.k}
                onClick={() => setType(t.k)}
                trailing={t.k === 'series' && !SERIES_AVAILABLE ? <SoonTag /> : null}
              >
                {t.l}
              </ChipButton>
            ))}
          </div>

          <SectionLabel>Sort by</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {sortOptions.map((o) => (
              <ChipButton key={o.k} grow active={state.sortBy === o.k} onClick={() => patch({ sortBy: o.k })}>
                {o.l}
              </ChipButton>
            ))}
          </div>

          <SectionLabel>Minimum rating</SectionLabel>
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {ratingTiers.map((r) => (
              <ChipButton key={r.k} grow active={state.minRating === r.k} onClick={() => patch({ minRating: r.k })}>
                {r.l}
              </ChipButton>
            ))}
          </div>

          <SectionLabel>Genre</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['all', ...genres].map((g) => (
              <ChipButton key={g} small active={state.genre === g} onClick={() => patch({ genre: g, mood: null })}>
                {g === 'all' ? 'All' : g}
              </ChipButton>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontWeight: 800,
        fontSize: 11,
        color: 'var(--fm-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.9px',
        marginBottom: 9
      }}
    >
      {children}
    </div>
  )
}

export function ChipButton({ children, active, onClick, grow, small, trailing }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: grow ? 1 : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: small ? '6px 11px' : '9px 6px',
        borderRadius: small ? 9 : 10,
        border: '1px solid',
        ...pill(active),
        fontWeight: small ? 700 : 800,
        fontSize: small ? 12 : 12.5,
        cursor: 'pointer'
      }}
    >
      {children}
      {trailing}
    </button>
  )
}

function AvatarMenu() {
  const { state, patch, nav } = useStore()
  const [hov, bind] = useHover()

  const avatarBg = state.avatar
    ? `#111 center/cover no-repeat url(${state.avatar})`
    : 'linear-gradient(135deg,var(--fm-accent),var(--fm-accent2))'
  const initial = state.avatar ? '' : 'A'
  const dark = state.mode === 'dark'

  return (
    <div data-fm-pop style={{ position: 'relative', flex: 'none' }}>
      <button
        {...bind}
        onClick={() => patch((s) => ({ menuOpen: !s.menuOpen, filterOpen: false }))}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 5px 4px 12px',
          border: `1px solid ${hov ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
          background: 'var(--fm-input)',
          borderRadius: 24,
          cursor: 'pointer',
          transition: 'border .2s'
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--fm-text)' }}>Alex</span>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: avatarBg,
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            color: '#fff',
            fontSize: 13
          }}
        >
          {initial}
        </span>
      </button>

      {state.menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 52,
            right: 0,
            width: 290,
            background: 'var(--fm-elev)',
            border: '1px solid var(--fm-border)',
            borderRadius: 18,
            padding: 8,
            boxShadow: '0 24px 60px rgba(0,0,0,.5)',
            zIndex: 60,
            animation: 'fmPop .2s ease'
          }}
        >
          <MenuRow onClick={() => nav('profile')} style={{ gap: 12, padding: 12 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: avatarBg,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                color: '#fff',
                fontSize: 16
              }}
            >
              {initial}
            </span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>Alex Rivera</div>
              <div style={{ fontSize: 12, color: 'var(--fm-muted)', fontWeight: 600 }}>View profile ›</div>
            </div>
          </MenuRow>

          <Divider />

          {MENU_LINKS.map((mi) => (
            <MenuRow key={mi.label} onClick={() => nav(mi.to, mi.extra)}>
              <span style={{ width: 20, display: 'grid', placeItems: 'center', color: 'var(--fm-muted)' }}>
                {mi.icon}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{mi.label}</span>
            </MenuRow>
          ))}

          <Divider />

          <div
            style={{
              padding: '8px 12px 4px',
              fontWeight: 800,
              fontSize: 11,
              color: 'var(--fm-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.8px'
            }}
          >
            Theme
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '6px 12px 10px', flexWrap: 'wrap' }}>
            {PRESET_LIST.map(([key, name, colour]) => (
              <Swatch
                key={key}
                name={name}
                colour={colour}
                active={state.preset === key}
                onClick={() => patch({ preset: key })}
              />
            ))}
          </div>

          <MenuRow onClick={() => patch({ mode: dark ? 'light' : 'dark' })} style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 14 }}>
              <span style={{ width: 20, textAlign: 'center', color: 'var(--fm-muted)' }}>{dark ? '☾' : '☀'}</span>
              {dark ? 'Dark mode' : 'Light mode'}
            </span>
            <span
              style={{
                width: 38,
                height: 22,
                borderRadius: 12,
                background: dark ? 'var(--fm-accent)' : 'var(--fm-border)',
                position: 'relative',
                transition: 'background .2s',
                flex: 'none'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: dark ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left .2s'
                }}
              />
            </span>
          </MenuRow>

          <Divider />

          <MenuRow onClick={() => patch({ shareOpen: true, menuOpen: false })}>
            <span style={{ width: 20, textAlign: 'center', color: 'var(--fm-muted)' }}>↗</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Share with friends</span>
          </MenuRow>
          <MenuRow onClick={() => nav('auth')}>
            <span style={{ width: 20, textAlign: 'center', color: 'var(--fm-accent)' }}>⏻</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--fm-accent)' }}>Sign out</span>
          </MenuRow>
        </div>
      )}
    </div>
  )
}

function MenuRow({ children, onClick, style }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: 'none',
        background: hov ? 'var(--fm-hover)' : 'none',
        color: 'var(--fm-text)',
        borderRadius: 11,
        cursor: 'pointer',
        textAlign: 'left',
        ...style
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--fm-border)', margin: '6px 4px' }} />
}

function Swatch({ name, colour, active, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      title={name}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        border: `2px solid ${active ? 'var(--fm-text)' : 'transparent'}`,
        background: `linear-gradient(135deg, ${colour}, ${colour}55)`,
        cursor: 'pointer',
        transform: hov ? 'scale(1.1)' : 'none',
        transition: 'transform .15s'
      }}
    />
  )
}
