import { useEffect, useState } from 'react'
// Imports React hooks:
// useEffect — sets up the browser hashchange event listener
// useState — tracks the current URL hash (route) and the selected movie for the modal

import AdminDashboard from './components/AdminDashboard'
// The admin control panel page — shown when the URL is #/admin

import ActorPage from './components/ActorPage'
// The actor profile page — shown when the URL is #/actor/:slug

import Home from './components/Home'
// The main movie discovery page — shown by default at #/

import MovieModal from './components/MovieModal'
// The floating modal that appears when the user clicks a movie card for details

import Navbar from './components/Navbar'
// The sticky top navigation bar with the logo, search input, and admin button

function App() {
  // The root application component; controls page routing and the movie detail modal

  const [selectedMovie, setSelectedMovie] = useState(null)
  // selectedMovie: the movie object currently shown in the detail modal; null means modal is closed

  const [path, setPath] = useState(window.location.hash || '#/')
  // path: the current URL hash string (e.g. '#/admin', '#/actor/tom-hanks')
  // Initializes from the current browser URL so deep links work on first load

  useEffect(() => {
    // Registers a hashchange listener so React re-renders when the URL hash changes

    const onHashChange = () => setPath(window.location.hash || '#/')
    // When the hash changes, update path state; fallback to '#/' if hash is empty

    window.addEventListener('hashchange', onHashChange)
    // Attaches the listener to the browser's hashchange event (fires on every hash navigation)

    return () => window.removeEventListener('hashchange', onHashChange)
    // Cleanup function: removes the listener when App unmounts to prevent memory leaks
  }, [])
  // Empty dependency array: runs once on mount, cleans up on unmount

  const rawRoute = (path || '#/').replace(/^#/, '')
  // Strips the leading '#' character from the hash to get the plain path string (e.g. '/admin')

  const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`
  // Ensures the route always starts with '/'; handles edge cases where the '#' was the entire hash

  const actorSlug = route.startsWith('/actor/') ? decodeURIComponent(route.replace('/actor/', '')) : null
  // Extracts the actor slug from the URL if the route starts with '/actor/'
  // decodeURIComponent handles URL-encoded characters like spaces and special chars
  // Returns null if the current route is not an actor page

  const isAdminRoute = route === '/admin'
  // Boolean: true only if the exact route is '/admin' — used to show AdminDashboard

  const isActorRoute = Boolean(actorSlug)
  // Boolean: true if we successfully extracted an actor slug — used to show ActorPage

  const openAdmin = () => {
    // Navigation helper called when the user clicks the Admin button in Navbar or Footer

    window.location.hash = '/admin'
    // Changes the browser URL hash to '#/admin', which triggers the hashchange event
  }

  const openHome = () => {
    // Navigation helper called when the user clicks the logo or Home button

    window.location.hash = '/'
    // Changes the browser URL hash to '#/', returning to the main discovery page
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Root container: fills the full viewport height, applies near-black bg and white text */}

      <Navbar onOpenAdmin={openAdmin} onOpenHome={openHome} />
      {/* Sticky navbar at the top; receives navigation callbacks as props */}

      {isAdminRoute ? (
        // If URL is #/admin, render the admin dashboard
        <AdminDashboard />
      ) : isActorRoute ? (
        // Else if URL is #/actor/:slug, render the actor profile page with the extracted slug
        <ActorPage actorSlug={actorSlug} />
      ) : (
        // Otherwise, render the home page and pass a callback to open the movie modal
        <Home onOpenMovie={(movie) => setSelectedMovie(movie)} />
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      {/* Movie detail modal — always rendered but invisible when movie is null */}
      {/* onClose resets selectedMovie to null, which closes the modal */}

      <footer className="border-t border-white/10 px-4 py-4 text-center text-sm text-muted">
        {/* Thin footer bar with a subtle top border — centered text, grey color */}

        <button onClick={openHome} className="mr-4 hover:text-white">
          {/* Home button — right margin separates it from the Admin button next to it */}
          Home
        </button>
        <button onClick={openAdmin} className="hover:text-primary">
          {/* Admin Login button — hovers to Netflix-red on interaction */}
          Admin Login
        </button>
      </footer>
    </div>
  )
}

export default App
// Makes App available as the default import in main.jsx
