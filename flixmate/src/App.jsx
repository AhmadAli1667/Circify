import { useStore } from './app/storeContext'
import Navbar from './components/Navbar'
import MovieModal from './components/MovieModal'
import TrailerModal from './components/TrailerModal'
import ShareModal from './components/ShareModal'
import ChatWidget from './components/ChatWidget'
import { Logo, Toast } from './components/primitives'

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
  const { state } = useStore()
  const Screen = SCREENS[state.screen] || Home

  if (state.moviesLoading) return <BootScreen />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fm-bg)', color: 'var(--fm-text)' }}>
      <Navbar />
      <Screen />

      <MovieModal />
      <ShareModal />
      <TrailerModal />
      <ChatWidget />
      <Toast message={state.toast} />
    </div>
  )
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
      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--fm-muted)' }}>Loading the catalogue…</span>
    </div>
  )
}
