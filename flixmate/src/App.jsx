import { Component } from 'react'
import { useStore } from './app/storeContext'
import { useIsMobile } from './app/ui'
import Navbar from './components/Navbar'
import MovieModal from './components/MovieModal'
import TrailerModal from './components/TrailerModal'
import ShareModal from './components/ShareModal'
import ChatWidget from './components/ChatWidget'
import { Logo, LoadingLine, Toast } from './components/primitives'

import Home from './screens/Home'
import Search from './screens/Search'
import Theatres from './screens/Theatres'
import ForYou from './screens/ForYou'
import Friends from './screens/Friends'
import Watchlist from './screens/Watchlist'
import Profile from './screens/Profile'
import Settings from './screens/Settings'
import Actor from './screens/Actor'
import CastCrew from './screens/CastCrew'
import Auth from './screens/Auth'
import Chat from './screens/Chat'

const SCREENS = {
  home: Home,
  search: Search,
  theatres: Theatres,
  foryou: ForYou,
  friends: Friends,
  watchlist: Watchlist,
  profile: Profile,
  settings: Settings,
  actor: Actor,
  castcrew: CastCrew,
  auth: Auth,
  chat: Chat
}

export default function App() {
  const { state, retryCatalogue } = useStore()
  const isMobile = useIsMobile()
  const Screen = SCREENS[state.screen] || Home

  if (state.moviesLoading) return <BootScreen />
  if (state.moviesError && state.movies.length === 0) {
    return <CatalogueErrorScreen message={state.moviesError} onRetry={retryCatalogue} />
  }

  // For You goes full-screen on mobile, a Shorts-style immersive feed has no
  // room, or need, for the normal nav chrome, its own overlaid back button
  // is the way out. Desktop keeps the navbar, there's space for it there.
  const immersive = isMobile && state.screen === 'foryou'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fm-bg)', color: 'var(--fm-text)' }}>
      {!immersive && <Navbar />}
      <ScreenErrorBoundary>
        <Screen />
      </ScreenErrorBoundary>

      <MovieModal />
      <ShareModal />
      <TrailerModal />
      {!immersive && <ChatWidget />}
      <Toast message={state.toast} />
    </div>
  )
}

/** Shown when the initial TMDb catalogue pool fails to load, with a retry that re-runs the bootstrap. */
function CatalogueErrorScreen({ message, onRetry }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
        textAlign: 'center',
        background: 'var(--fm-bg)',
        color: 'var(--fm-text)'
      }}
    >
      <Logo size={40} />
      <div style={{ fontWeight: 800, fontSize: 17 }}>Couldn&apos;t load movies</div>
      <div style={{ color: 'var(--fm-muted)', fontSize: 13.5, maxWidth: 360, lineHeight: 1.5 }}>
        {message || 'Something went wrong reaching the catalogue.'}
      </div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 4,
          padding: '12px 24px',
          border: 'none',
          borderRadius: 14,
          background: 'var(--fm-accent)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  )
}

/**
 * One thrown render error in any screen used to blank the whole app to a
 * white page. This contains it to the screen area and offers a way back,
 * a full reload rather than a local reset since whatever state caused the
 * crash is still sitting in the store otherwise.
 */
class ScreenErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Screen crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 24,
          textAlign: 'center'
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 17 }}>Something went wrong</div>
        <div style={{ color: 'var(--fm-muted)', fontSize: 13.5, maxWidth: 360, lineHeight: 1.5 }}>
          This screen hit an error. Reloading usually clears it.
        </div>
        <button
          onClick={() => window.location.assign('/')}
          style={{
            marginTop: 4,
            padding: '12px 24px',
            border: 'none',
            borderRadius: 14,
            background: 'var(--fm-accent)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Go home
        </button>
      </div>
    )
  }
}

/** Shown while the initial TMDb catalogue pool is being fetched. */
function BootScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'var(--fm-bg)',
        color: 'var(--fm-text)',
        animation: 'fmFade .3s ease'
      }}
    >
      <Logo size={48} />
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: '3px solid var(--fm-border)',
          borderTopColor: 'var(--fm-accent)',
          animation: 'fmSpin .8s linear infinite'
        }}
      />
      <LoadingLine style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }} />
    </div>
  )
}
