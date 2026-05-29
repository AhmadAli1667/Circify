import { motion } from 'framer-motion'
// motion: Framer Motion's animated element variants — provides initial/animate/transition props for smooth animations

import { Film, Heart, Info, Play, SlidersHorizontal, Star } from 'lucide-react'
// Film — shown when there are no search results
// Heart — small icon overlaid on actor avatar thumbnails
// Info — "More Info" button in the featured movie hero section
// Play — "Play" button that opens the trailer in a new tab
// SlidersHorizontal — icon in the Discovery Wizard sidebar header
// Star — rating star shown on movie cards

import { useEffect, useMemo, useState } from 'react'
// useEffect — sets up the auto-rotating hero carousel timer
// useMemo — memoizes the featured movie list so it doesn't recalculate on every render
// useState — tracks the current index of the featured hero carousel

import { topCast } from '../data/actors'
// topCast: array of 12 actor objects with topCast=true — shown in the "Top Cast" grid

import SafeImage from './SafeImage'
// Wrapper around <img> that handles broken image URLs with a fallback image

import { useMovies } from '../store'
// useMovies: provides filteredMovies, rows, genres, filters, updateFilter, resetFilters, getEffectiveRating

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'
// Consistent placeholder image URL for failed movie poster loads
// picsum.photos generates the same image every time for a given seed string

const FALLBACK_AVATAR = 'https://picsum.photos/seed/flixmate-fallback-avatar/180/180'
// Consistent placeholder image URL for failed actor photo loads

function MovieCard({ movie, onOpen, effectiveRating }) {
  // A compact movie poster card used in the horizontal scroll rows
  // movie: the movie object to display
  // onOpen: callback called with the movie object when the card is clicked
  // effectiveRating: the user's saved rating or the movie's default rating

  return (
    <button
      onClick={() => onOpen(movie)}
      // Calls the parent's onOpenMovie handler to open the movie detail modal
      className="group min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-surface text-left transition hover:scale-[1.03] hover:border-primary/60"
      // group: enables child elements to respond to hover with group-hover: classes
      // min-w-[180px]: prevents cards from shrinking below 180px in the horizontal scroll row
      // hover:scale-[1.03]: subtle zoom on hover
      // hover:border-primary/60: border turns slightly red on hover
    >
      <SafeImage
        src={movie.posterUrl}
        // Movie poster — may be a Wikipedia URL or a picsum.photos placeholder
        fallbackSrc={FALLBACK_POSTER}
        // Shown if the poster URL fails to load
        alt={movie.title}
        // Accessibility text for screen readers
        className="h-[250px] w-full object-cover"
        // Fixed height of 250px; object-cover crops the image to fill the space
      />
      <div className="space-y-1 p-3">
        {/* Card info section below the poster image */}

        <p className="line-clamp-1 text-sm font-semibold text-white">{movie.title}</p>
        {/* line-clamp-1: truncates long titles with an ellipsis after 1 line */}

        <p className="text-xs text-muted">{movie.year}</p>
        {/* Release year in small muted text */}

        <div className="flex items-center gap-1 text-xs text-muted">
          {/* Star icon + rating in a small horizontal row */}
          <Star size={12} className="text-primary" />
          {/* Tiny 12px Netflix-red star */}
          {effectiveRating}/10
          {/* Displays user's rating if set, otherwise the movie's default rating */}
        </div>
      </div>
    </button>
  )
}

function Home({ onOpenMovie }) {
  // The main movie discovery page
  // onOpenMovie: callback called when a movie card or hero button is clicked — sets the modal movie in App.jsx

  const {
    filteredMovies,
    // All movies that pass the current search query + filter settings
    rows,
    // Pre-sorted movie groups: Trending Now, Top Rated, Action Boost, Sci-Fi, Crime, Drama
    genres,
    // All unique genre strings from the movies array, sorted alphabetically, with 'All' prepended
    filters,
    // Current filter state: { yearMin, yearMax, minRating, genre }
    updateFilter,
    // Function to update a single filter field — updateFilter('yearMin', 1990)
    resetFilters,
    // Function to reset all filters back to defaults
    getEffectiveRating
    // Returns user's rating for a movie if set, otherwise the movie's default rating
  } = useMovies()

  const [heroIndex, setHeroIndex] = useState(0)
  // heroIndex: which movie is currently displayed in the featured hero section

  const featuredList = useMemo(() => rows[0]?.movies?.slice(0, 8) || [], [rows])
  // Takes the first 8 movies from the "Trending Now" row (rows[0]) for the hero carousel
  // Optional chaining handles the case where rows might be empty on first render
  // useMemo: only recalculates when rows changes

  const featuredMovie = featuredList[heroIndex % Math.max(featuredList.length, 1)]
  // Gets the featured movie at the current index
  // Modulo prevents out-of-bounds access; Math.max prevents division by zero

  useEffect(() => {
    // Sets up a 5-second interval to auto-advance the hero carousel

    if (!featuredList.length) {
      // If there are no featured movies (empty search result), don't start the timer
      return undefined
      // Returns undefined to satisfy React's requirement of returning a cleanup function or nothing
    }
    const timer = setInterval(() => {
      // setInterval fires a callback every 5000ms (5 seconds)

      setHeroIndex((prev) => (prev + 1) % featuredList.length)
      // Advances the hero index by 1, wrapping back to 0 when it reaches the end of the list
    }, 5000)
    return () => clearInterval(timer)
    // Cleanup: clears the interval when the component unmounts or featuredList changes
    // Prevents the interval from leaking or running with stale values
  }, [featuredList])
  // Re-runs when featuredList changes (e.g. search query changes the trending movies)

  const openActor = (slug) => {
    // Navigates to an actor's profile page by updating the URL hash

    window.location.hash = `/actor/${slug}`
    // Sets the hash to /actor/:slug — App.jsx's hashchange listener picks this up and renders ActorPage
  }

  return (
    <main className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 md:grid-cols-[280px,1fr] md:px-8">
      {/* Two-column layout on medium screens: 280px fixed sidebar + flexible main content */}

      <aside className="h-fit rounded-2xl border border-white/10 bg-surface/70 p-4">
        {/* Discovery Wizard sidebar — sticks to the top of its column */}

        <div className="mb-4 flex items-center gap-2">
          {/* Sidebar header row */}
          <SlidersHorizontal size={18} className="text-primary" />
          {/* Filter/sliders icon in Netflix-red */}
          <h2 className="font-semibold text-white">Discovery Wizard</h2>
          {/* Section title */}
        </div>

        <div className="space-y-4 text-sm">
          {/* Vertical stack of filter controls with spacing */}

          <label className="block">
            {/* Year Min slider */}
            <span className="text-muted">Year Min: {filters.yearMin}</span>
            {/* Displays the current yearMin value next to the label */}
            <input
              type="range"
              min="1950"
              max="2026"
              // Slider range: 1950 to 2026
              value={filters.yearMin}
              // Controlled input — value reflects the current filter state
              onChange={(event) => updateFilter('yearMin', Number(event.target.value))}
              // On slider change, converts value to number and updates the yearMin filter
              className="mt-2 w-full"
            />
          </label>

          <label className="block">
            {/* Year Max slider */}
            <span className="text-muted">Year Max: {filters.yearMax}</span>
            <input
              type="range"
              min="1950"
              max="2026"
              value={filters.yearMax}
              onChange={(event) => updateFilter('yearMax', Number(event.target.value))}
              // Updates the yearMax filter
              className="mt-2 w-full"
            />
          </label>

          <label className="block">
            {/* Minimum Rating slider */}
            <span className="text-muted">Minimum Rating: {filters.minRating.toFixed(1)}</span>
            {/* toFixed(1) shows 1 decimal place — e.g. "7.5" not "7.500..." */}
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              // Allows 0.1 increments — enables rating precision like 7.3, 8.5
              value={filters.minRating}
              onChange={(event) => updateFilter('minRating', Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>

          <label className="block">
            {/* Genre dropdown filter */}
            <span className="text-muted">Genre</span>
            <select
              value={filters.genre}
              // Controlled select — shows the currently active genre filter
              onChange={(event) => updateFilter('genre', event.target.value)}
              // Updates the genre filter when the user selects a different option
              className="mt-2 w-full rounded-md border border-white/15 bg-black/40 px-2 py-2 text-white"
            >
              {genres.map((genre) => (
                // Renders one option per unique genre ('All' is always first)
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={resetFilters}
            // Resets all four filters (yearMin, yearMax, minRating, genre) to their defaults
            className="w-full rounded-md border border-white/15 py-2 text-muted transition hover:border-primary hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      </aside>

      <section className="space-y-8">
        {/* Main content area: hero, top cast, and movie rows */}

        {featuredMovie && (
          // Only renders the hero section when there is a featured movie to display

          <motion.div
            key={featuredMovie.id}
            // key forces React to re-mount the component when the featured movie changes — this triggers the entry animation
            initial={{ opacity: 0, y: 12 }}
            // Hero starts invisible and 12px below its final position
            animate={{ opacity: 1, y: 0 }}
            // Animates to fully visible and natural position
            transition={{ duration: 0.4 }}
            // 400ms animation — slightly slower for a cinematic feel
            className="relative overflow-hidden rounded-2xl border border-white/15"
          >
            <SafeImage
              src={featuredMovie.posterUrl}
              fallbackSrc={FALLBACK_POSTER}
              alt={featuredMovie.title}
              className="h-[380px] w-full object-cover"
              // Full-width hero image — 380px tall, cropped to cover
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent p-6 md:p-8">
              {/* Gradient overlay: dark on the left (for readable text), transparent on the right (shows the poster) */}

              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Featured Now</p>
              {/* Small red label above the movie title — wide letter-spacing for style */}

              <h1 className="max-w-xl text-3xl font-black text-white md:text-5xl">{featuredMovie.title}</h1>
              {/* Movie title — very large on desktop (5xl = 48px), smaller on mobile */}

              <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">{featuredMovie.synopsis}</p>
              {/* Synopsis text at 85% white opacity — slightly transparent for depth */}

              <div className="mt-5 flex items-center gap-3">
                {/* Row of hero action buttons */}

                <button
                  onClick={() => window.open(featuredMovie.trailerLink, '_blank', 'noopener,noreferrer')}
                  // Opens the YouTube trailer search link in a new tab
                  // noopener,noreferrer: security flags preventing the new page from accessing this window
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold"
                  // Netflix-red play button
                >
                  <Play size={14} />
                  {/* Play triangle icon — 14px */}
                  Play
                </button>
                <button
                  onClick={() => onOpenMovie(featuredMovie)}
                  // Opens the movie detail modal for the featured film
                  className="flex items-center gap-2 rounded-lg border border-white/25 bg-black/30 px-4 py-2 text-sm"
                  // Semi-transparent bordered button
                >
                  <Info size={14} />
                  {/* Info circle icon */}
                  More Info
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <section className="rounded-2xl border border-white/10 bg-surface/60 p-4 md:p-6">
          {/* Top Cast section card */}

          <div className="mb-4 flex items-center justify-between gap-2">
            {/* Header row: title on the left, count on the right */}
            <h2 className="text-2xl font-bold text-white">Top Cast</h2>
            <span className="text-sm text-muted">{topCast.length}</span>
            {/* Shows the number of cast members in the section */}
          </div>

          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {/* 2-column grid on medium screens; single column on mobile */}

            {topCast.map((actor) => (
              // Renders one card per actor in the topCast array
              <button
                key={actor.slug}
                // Unique key using the actor's URL slug
                onClick={() => openActor(actor.slug)}
                // Navigates to the actor's profile page
                className="group relative grid grid-cols-[76px,1fr] items-center gap-4 rounded-xl border border-white/0 p-2 text-left transition hover:border-white/10 hover:bg-black/25"
                // group: enables group-hover: on children
                // grid-cols-[76px,1fr]: fixed avatar width + flexible name column
                // hover:border-white/10: subtle border appears on hover
              >
                <div className="relative">
                  {/* Wrapper for avatar + heart badge */}

                  <SafeImage
                    src={actor.imageUrl}
                    fallbackSrc={FALLBACK_AVATAR}
                    alt={actor.name}
                    className="h-[76px] w-[76px] rounded-full object-cover"
                    // Circular avatar — 76x76px
                  />
                  <span className="absolute bottom-[-2px] right-[-2px] rounded-full bg-zinc-700 p-1 text-white">
                    {/* Small badge positioned at the bottom-right of the avatar */}
                    <Heart size={12} className="text-white/90" />
                    {/* Tiny heart icon — decorative */}
                  </span>
                </div>

                <div>
                  {/* Actor name and role info */}
                  <p className="text-lg font-semibold text-white group-hover:text-primary">{actor.name}</p>
                  {/* Name turns Netflix-red when the card is hovered */}
                  <p className="text-lg text-muted">{actor.knownForRole}</p>
                  {/* The actor's most famous role (e.g. "Alice Kingsleigh") */}
                </div>
              </button>
            ))}
          </div>
        </section>

        {filteredMovies.length === 0 && (
          // Only renders this empty state when search/filters return zero results
          <div className="rounded-xl border border-white/10 bg-surface p-8 text-center">
            <Film className="mx-auto mb-3 text-primary" />
            {/* Centered film icon in Netflix-red */}
            <p className="text-lg font-semibold text-white">No results found</p>
            <p className="mt-1 text-sm text-muted">Try changing search keywords or filters.</p>
          </div>
        )}

        {rows
          .filter((row) => row.movies.length > 0)
          // Hides any row that has no movies — e.g. "Crime Pulse" if genre filter is set to "Drama"
          .map((row, idx) => (
            <motion.div
              key={row.title}
              // Row title is unique so it works as a key
              initial={{ opacity: 0, y: 18 }}
              // Each row starts slightly below and invisible
              animate={{ opacity: 1, y: 0 }}
              // Animates to full opacity at natural position
              transition={{ delay: idx * 0.06 }}
              // Staggered delay: each row starts 60ms after the previous one for a cascade effect
            >
              <h3 className="mb-3 text-lg font-semibold text-white">{row.title}</h3>
              {/* Row category title — e.g. "Trending Now", "Top Rated" */}

              <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Horizontal scroll container — cards overflow horizontally with a 3px gap */}
                {/* pb-2: bottom padding so the custom scrollbar doesn't overlap the last card */}

                {row.movies.map((movie) => (
                  <MovieCard
                    key={`${row.title}-${movie.id}`}
                    // Composite key combining row and movie ID to ensure uniqueness across rows
                    movie={movie}
                    // Passes the full movie object to the card
                    onOpen={onOpenMovie}
                    // Passes the modal-opening callback
                    effectiveRating={getEffectiveRating(movie)}
                    // Pre-computes the display rating to avoid calling getEffectiveRating inside MovieCard
                  />
                ))}
              </div>
            </motion.div>
          ))}
      </section>
    </main>
  )
}

export default Home
// Makes Home available for import in App.jsx
