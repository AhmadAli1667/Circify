import { useStore } from './app/storeContext'
import Navbar from './components/Navbar'
import MovieModal from './components/MovieModal'
import TrailerModal from './components/TrailerModal'
import ShareModal from './components/ShareModal'
import ChatWidget from './components/ChatWidget'
import { Toast } from './components/primitives'

import Home from './screens/Home'
import Search from './screens/Search'
import Theatres from './screens/Theatres'
import ForYou from './screens/ForYou'
import Friends from './screens/Friends'
import Watchlist from './screens/Watchlist'
import Profile from './screens/Profile'
import Settings from './screens/Settings'
import Actor from './screens/Actor'
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
  auth: Auth,
  chat: Chat
}

export default function App() {
  const { state } = useStore()
  const Screen = SCREENS[state.screen] || Home

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
