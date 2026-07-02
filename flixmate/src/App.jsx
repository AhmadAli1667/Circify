import { useEffect, useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import ActorPage from './components/ActorPage'
import Home from './components/Home'
import MovieModal from './components/MovieModal'
import Navbar from './components/Navbar'

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [path, setPath] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => setPath(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const rawRoute = (path || '#/').replace(/^#/, '')
  const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`
  const actorSlug = route.startsWith('/actor/') ? decodeURIComponent(route.replace('/actor/', '')) : null
  const isAdminRoute = route === '/admin'
  const isActorRoute = Boolean(actorSlug)

  const openAdmin = () => { window.location.hash = '/admin' }
  const openHome = () => { window.location.hash = '/' }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar onOpenAdmin={openAdmin} onOpenHome={openHome} />

      {isAdminRoute ? (
        <AdminDashboard />
      ) : isActorRoute ? (
        <ActorPage actorSlug={actorSlug} />
      ) : (
        <Home onOpenMovie={(movie) => setSelectedMovie(movie)} />
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      <footer className="border-t border-white/10 px-4 py-4 text-center text-sm text-muted">
        <button onClick={openHome} className="mr-4 hover:text-white">Home</button>
        <button onClick={openAdmin} className="hover:text-primary">Admin Login</button>
      </footer>
    </div>
  )
}

export default App
