import { AnimatePresence, motion } from 'framer-motion'
// AnimatePresence: Framer Motion wrapper that animates components when they mount/unmount from the DOM
// motion: Framer Motion's enhanced HTML elements that accept animation props (initial, animate, exit)

import { ExternalLink, ListPlus, Star, X } from 'lucide-react'
// ExternalLink — icon for the "Watch Trailer" link (opens in a new tab)
// ListPlus — icon for the Add to Watchlist button
// Star — icon used in the 1-5 star rating system
// X — close button icon in the modal header

import { actorSlugByName } from '../data/actors'
// Lookup map: actor name string → URL slug (e.g. "Tom Hanks" → "tom-hanks")
// Used to make cast member names clickable links to their profile pages

import SafeImage from './SafeImage'
// Handles broken image URLs gracefully — falls back to a placeholder if the poster fails to load

import { useMovies } from '../store'
// Imports movie context to access watchlist, ratings, and recommendation engine

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'
// Fallback image URL used when a movie poster fails to load
// picsum.photos generates consistent placeholder images based on the seed string

function StarRating({ current, onRate }) {
  // A 1–5 star interactive rating widget
  // current: the currently selected rating value (0, 2, 4, 6, 8, or 10)
  // onRate: callback called with the new rating value (star × 2) when a star is clicked

  return (
    <div className="flex items-center gap-1">
      {/* Horizontal row of 5 star buttons with a 4px gap */}

      {[1, 2, 3, 4, 5].map((star) => (
        // Generates 5 star buttons numbered 1 through 5
        <button
          key={star}
          // React needs a unique key for each element in a list
          onClick={() => onRate(star * 2)}
          // Converts 1–5 star clicks to 2–10 ratings (1★→2, 2★→4, 3★→6, 4★→8, 5★→10)
          className="transition hover:scale-110"
          // Smooth scale animation on hover for a tactile feel
          aria-label={`Rate ${star}`}
          // Accessibility: screen reader announces "Rate 1", "Rate 2", etc.
        >
          <Star
            size={18}
            // 18px star icon
            className={current >= star * 2 ? 'fill-primary text-primary' : 'text-white/50'}
            // If the current rating meets or exceeds this star's value, fill it Netflix-red
            // Otherwise, show it as dimmed white/50 (unfilled)
          />
        </button>
      ))}
    </div>
  )
}

function MovieModal({ movie, onClose }) {
  // The movie detail modal component
  // movie: the movie object to display; null when the modal is closed
  // onClose: callback called when the user dismisses the modal

  const { watchlist, toggleWatchlist, rateMovie, ratings, getSmartRecs } = useMovies()
  // watchlist: array of movie IDs that the user has saved
  // toggleWatchlist: adds or removes a movie ID from the watchlist
  // rateMovie: saves a user's rating for a movie
  // ratings: object mapping movie IDs to user-assigned ratings
  // getSmartRecs: function that returns up to 6 similar movies based on genre/director/cast

  const openActor = (name) => {
    // Called when the user clicks an actor's name in the cast list

    const slug = actorSlugByName[name]
    // Looks up the actor's URL slug from their name string

    if (!slug) {
      // If the actor has no profile page, do nothing
      return
    }
    onClose()
    // Close the movie modal first so the actor page slides in cleanly

    window.location.hash = `/actor/${slug}`
    // Navigates to the actor's profile page by updating the URL hash
  }

  return (
    <AnimatePresence>
      {/* AnimatePresence watches for child components being removed and plays their exit animations */}

      {movie ? (
        // Only render the modal when a movie is selected (movie !== null)

        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          // Full-screen overlay: covers entire viewport, dark semi-transparent backdrop
          // z-50: above everything else (navbar is z-40)
          // flex center: positions the modal card in the middle of the screen
          initial={{ opacity: 0 }}
          // Start invisible
          animate={{ opacity: 1 }}
          // Fade in to full opacity
          exit={{ opacity: 0 }}
          // Fade out when removed from DOM
          onClick={onClose}
          // Clicking the dark backdrop (outside the modal) closes it
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            // Starts slightly below, invisible, and slightly shrunk
            animate={{ y: 0, opacity: 1, scale: 1 }}
            // Animates to full size at its natural position
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            // Exits by dropping slightly and fading out
            transition={{ duration: 0.25 }}
            // 250ms animation duration — fast enough to feel snappy
            onClick={(event) => event.stopPropagation()}
            // Prevents clicks inside the modal from bubbling to the backdrop (which would close it)
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/15 bg-white/10 p-4 shadow-glass backdrop-blur-2xl md:p-6"
            // max-h-[90vh]: prevents the modal from overflowing the viewport vertically
            // overflow-y-auto: scrollable if content is taller than 90vh
            // max-w-5xl: caps width at ~1024px
            // bg-white/10 + backdrop-blur: frosted glass effect
            // shadow-glass: custom deep shadow from tailwind.config.js
          >
            <div className="flex items-start justify-between gap-4">
              {/* Modal header row: title on the left, close button on the right */}

              <h2 className="text-xl font-bold text-white md:text-3xl">{movie.title}</h2>
              {/* Movie title — smaller on mobile, 3xl on medium screens */}

              <button className="rounded-md p-1 text-muted hover:text-white" onClick={onClose}>
                {/* Close button — triggers the exit animation via AnimatePresence */}
                <X />
                {/* X icon */}
              </button>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[280px,1fr]">
              {/* Two-column layout on medium screens: fixed-width poster + flexible details */}

              <SafeImage
                src={movie.posterUrl}
                // Movie poster URL — may be from Wikipedia or picsum placeholder
                fallbackSrc={FALLBACK_POSTER}
                // Shown if the poster URL fails to load
                alt={movie.title}
                // Accessibility description of the image
                className="h-[400px] w-full rounded-xl object-cover"
                // Fixed 400px height, full column width, rounded corners, cropped to fill
              />
              <div className="space-y-4">
                {/* Right column: metadata, synopsis, cast, rating, actions */}

                <p className="text-sm text-muted">
                  {/* Secondary info line: year, genres, director */}
                  {movie.year} • {movie.genre.join(' / ')} • Director: {movie.director}
                  {/* Bullet-separated: "2008 • Action / Crime • Director: Christopher Nolan" */}
                </p>
                <p className="text-sm text-white/90">{movie.synopsis}</p>
                {/* Plot synopsis text — slightly transparent white */}

                <p className="text-sm text-muted">
                  Cast:{' '}
                  {/* Cast label followed by clickable/non-clickable actor names */}
                  {movie.leadCast.map((name, index) => {
                    // Iterates over each cast member name

                    const slug = actorSlugByName[name]
                    // Looks up if this actor has a profile page in our actor data

                    const isLast = index === movie.leadCast.length - 1
                    // True for the last actor in the list — determines whether to add a trailing comma

                    if (!slug) {
                      // Actor has no profile page — render as plain text
                      return <span key={name}>{name}{isLast ? '' : ', '}</span>
                      // Appends ", " after each name except the last one
                    }

                    return (
                      <span key={name}>
                        {/* Wrapping span provides the key for React's list reconciliation */}
                        <button onClick={() => openActor(name)} className="text-white hover:text-primary">
                          {/* Clickable actor name — hovers to Netflix-red */}
                          {name}
                        </button>
                        {isLast ? '' : ', '}
                        {/* Comma separator after each name except the last */}
                      </span>
                    )
                  })}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Row of action buttons — wraps to next line on small screens */}

                  <button
                    onClick={() => toggleWatchlist(movie.id)}
                    // Adds the movie if not in watchlist; removes it if already there
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold transition hover:brightness-110"
                    // Netflix-red button with subtle brightness increase on hover
                  >
                    <ListPlus size={16} />
                    {/* List + icon */}
                    {watchlist.includes(movie.id) ? 'Remove Watchlist' : 'Add to Watchlist'}
                    {/* Label changes based on whether this movie is already in the watchlist */}
                  </button>
                  <a
                    href={movie.trailerLink}
                    // Links to a YouTube search results page for the movie trailer
                    target="_blank"
                    // Opens in a new browser tab
                    rel="noreferrer"
                    // Security: prevents the new page from accessing window.opener
                    className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-primary"
                    // Outlined button; border turns Netflix-red on hover
                  >
                    <ExternalLink size={15} />
                    {/* External link arrow icon */}
                    Watch Trailer
                  </a>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  {/* Rating card — dark rounded panel */}

                  <p className="mb-2 text-xs uppercase tracking-wide text-muted">Your Rating</p>
                  {/* Section label — small caps style */}

                  <div className="flex items-center gap-3">
                    {/* Row: star widget + numeric display */}

                    <StarRating current={ratings[movie.id] || 0} onRate={(value) => rateMovie(movie.id, value)} />
                    {/* Passes the user's saved rating (or 0) and a callback to save a new rating */}

                    <span className="text-sm text-muted">{ratings[movie.id] || movie.rating}/10</span>
                    {/* Shows the user's rating if set; otherwise shows the movie's default rating */}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* Smart recommendations section at the bottom of the modal */}

              <h3 className="mb-3 text-lg font-semibold text-white">Because you watched {movie.title}</h3>
              {/* Section heading with the current movie title for context */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1 column on mobile, 2 on small, 3 on large screens */}

                {getSmartRecs(movie.id).map((rec) => (
                  // getSmartRecs returns up to 6 movies scored by shared genre/director/cast/relation
                  <div key={rec.id} className="rounded-xl border border-white/10 bg-black/35 p-3">
                    {/* Individual recommendation card — dark rounded panel */}
                    <p className="font-semibold text-white">{rec.title}</p>
                    {/* Recommended movie title */}
                    <p className="text-xs text-muted">
                      {rec.year} • {rec.genre.join(' / ')}
                      {/* Year and genres of the recommended movie */}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
      {/* null when no movie is selected — AnimatePresence plays the exit animation first */}
    </AnimatePresence>
  )
}

export default MovieModal
// Makes MovieModal available for import in other files
