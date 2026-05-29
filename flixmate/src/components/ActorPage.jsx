import { ArrowUpDown, Calendar, Clapperboard, Heart, Link2, UserRound } from 'lucide-react'
// ArrowUpDown — sort icon next to the sort dropdown
// Calendar — icon next to the movie year in each filmography entry
// Clapperboard — icon for the Filmography section header and placeholder poster
// Heart — icon shown next to the rating in each filmography entry
// Link2 — small link icon in the social media buttons
// UserRound — user silhouette icon next to the actor's age

import { useMemo, useState } from 'react'
// useMemo — memoizes the combined filmography credits list
// useState — tracks the selected sort option

import { actorsBySlug } from '../data/actors'
// actorsBySlug: a pre-built lookup map { "tom-hanks": actorObject, ... }
// Used to find the actor record by URL slug without searching the array every time

import SafeImage from './SafeImage'
// Handles broken image URLs gracefully — falls back to a placeholder poster or avatar

import { useMovies } from '../store'
// Provides the movies array and getEffectiveRating function for building the filmography

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'
// Placeholder image used when a movie poster URL fails to load

const FALLBACK_AVATAR = 'https://picsum.photos/seed/flixmate-fallback-avatar/300/400'
// Placeholder image used when an actor photo URL fails to load

const SORT_OPTIONS = [
  // Array of sort option objects rendered in the dropdown — id matches sorting logic below
  { id: 'rating-desc', label: 'Rating (High to Low)' },
  // Default sort: highest rated movies first
  { id: 'year-desc', label: 'Year (Newest First)' },
  // Most recent movies first
  { id: 'year-asc', label: 'Year (Oldest First)' },
  // Oldest movies first (chronological)
  { id: 'title-asc', label: 'Title (A to Z)' }
  // Alphabetical by movie title
]

const sortCredits = (credits, sortBy) => {
  // Pure function that returns a sorted copy of the credits array based on sortBy string
  // credits: array of { title, year, rating, role, posterUrl }
  // sortBy: one of the id strings from SORT_OPTIONS

  const working = [...credits]
  // Creates a shallow copy so we don't mutate the original array

  if (sortBy === 'year-desc') {
    return working.sort((a, b) => b.year - a.year || b.rating - a.rating)
    // Primary sort: newest first; secondary sort: higher rated first (tiebreaker)
  }
  if (sortBy === 'year-asc') {
    return working.sort((a, b) => a.year - b.year || b.rating - a.rating)
    // Primary sort: oldest first; secondary sort: higher rated first
  }
  if (sortBy === 'title-asc') {
    return working.sort((a, b) => a.title.localeCompare(b.title))
    // localeCompare: language-aware string comparison for correct alphabetical order
  }
  return working.sort((a, b) => b.rating - a.rating || b.year - a.year)
  // Default (rating-desc): highest rated first; newest first as tiebreaker
}

function ActorPage({ actorSlug }) {
  // Displays an actor's full profile: photo, bio, filmography, and quick facts
  // actorSlug: URL-friendly slug extracted from the hash route (e.g. "morgan-freeman")

  const actor = actorsBySlug[actorSlug]
  // Looks up the actor object from the static data using the URL slug
  // Returns undefined if the slug doesn't match any known actor

  const { movies, getEffectiveRating } = useMovies()
  // movies: full array of all movies (used to find user-added movies starring this actor)
  // getEffectiveRating: returns user's rating if set, otherwise movie's default rating

  const [sortBy, setSortBy] = useState('rating-desc')
  // sortBy: currently selected sort option — defaults to Rating (High to Low)

  const combinedCredits = useMemo(() => {
    // Builds the filmography by merging hardcoded actor credits with movies from the main database

    if (!actor) {
      // If the actor wasn't found, return an empty array to avoid errors below
      return []
    }

    const creditsByTitle = new Map()
    // A Map used to deduplicate movies by title — ensures no movie appears twice

    actor.movieCredits.forEach((credit) => {
      creditsByTitle.set(credit.title, { ...credit })
      // Adds each hardcoded credit to the map, keyed by movie title
      // Spreads to avoid mutating the original objects
    })

    movies
      .filter((movie) => movie.leadCast.includes(actor.name))
      // Finds all movies in the database where this actor is in the lead cast
      .forEach((movie) => {
        const existing = creditsByTitle.get(movie.title)
        // Checks if this movie is already in the credits map from the hardcoded data

        const next = {
          title: movie.title,
          // Movie title from the database
          year: movie.year,
          // Year from the database (may be more accurate than hardcoded)
          rating: getEffectiveRating(movie),
          // Uses the user's personal rating if they've rated it, otherwise default
          role: existing?.role || 'Lead Cast',
          // Keeps the hardcoded role if it exists; defaults to "Lead Cast" for database-only matches
          posterUrl: movie.posterUrl
          // Uses the database poster URL (often better than nothing for newly added movies)
        }
        creditsByTitle.set(movie.title, next)
        // Overwrites or adds the credit in the map — database version takes precedence
      })

    return sortCredits(Array.from(creditsByTitle.values()), sortBy)
    // Converts the Map to an array and sorts it by the user's selected sort option
  }, [actor, movies, getEffectiveRating, sortBy])
  // Re-runs when actor, movies, ratings, or sort order change

  if (!actor) {
    // Shows a friendly not-found message if the URL slug doesn't match any actor
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-white/10 bg-surface/70 p-8 text-center">
          <p className="text-xl font-semibold text-white">Actor not found</p>
          <p className="mt-2 text-sm text-muted">Try opening a profile from the Top Cast section.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1300px] space-y-8 px-4 py-6 md:px-8">
      {/* Page layout: full width up to 1300px, sections separated by 32px spacing */}

      <section className="overflow-hidden rounded-2xl border border-white/15 bg-surface/60">
        {/* Actor profile card — photo on the left, bio on the right */}

        <div className="grid gap-6 p-5 md:grid-cols-[260px,1fr] md:p-8">
          {/* Two-column layout on medium screens: fixed photo + flexible bio */}

          <SafeImage
            src={actor.imageUrl}
            // Actor photo — mostly Wikipedia portrait images
            fallbackSrc={FALLBACK_AVATAR}
            alt={actor.name}
            className="h-[320px] w-full rounded-2xl object-cover"
            // 320px tall portrait; object-cover ensures it fills the space without distortion
          />

          <div className="space-y-4">
            {/* Right column: actor name, role, biography */}

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">Actor Profile</p>
              {/* Small red label above the name — wide letter-spacing for a stylized look */}

              <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">{actor.name}</h1>
              {/* Actor's full name — very large on desktop */}

              <p className="mt-2 text-sm text-muted">Known For: {actor.knownForRole}</p>
              {/* The actor's most famous role — shown in grey below the name */}
            </div>

            <div className="space-y-3 text-sm leading-7 text-white/90">
              {/* Biography paragraphs — line height 7 for readability */}
              {actor.biography.map((paragraph) => (
                // Each actor has 3 biography paragraphs in the data
                <p key={paragraph}>{paragraph}</p>
                // key uses the paragraph text itself (each paragraph is unique)
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,330px]">
        {/* Two-column layout on large screens: filmography table + quick facts sidebar */}

        <div className="rounded-2xl border border-white/10 bg-surface/60 p-5 md:p-6">
          {/* Filmography card */}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* Header row: section title + sort dropdown — wraps on small screens */}

            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Clapperboard size={19} className="text-primary" />
              {/* Clapperboard icon in Netflix-red */}
              Filmography
            </h2>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
              {/* Sort control: icon + label + dropdown */}
              <ArrowUpDown size={14} className="text-primary" />
              {/* Sort arrows icon */}
              Sort
              <select
                value={sortBy}
                // Controlled select — shows the currently active sort
                onChange={(event) => setSortBy(event.target.value)}
                // Updates sortBy state, which triggers combinedCredits to recalculate
                className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-sm text-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  // Renders one <option> per sort option
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                    {/* Human-readable label e.g. "Rating (High to Low)" */}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            {/* Vertical list of filmography entries */}

            {combinedCredits.map((credit) => (
              <article
                key={`${credit.title}-${credit.year}`}
                // Composite key: title + year combination should be unique per actor
                className="grid gap-3 rounded-xl border border-white/10 bg-black/25 p-3 md:grid-cols-[68px,1fr]"
                // Two-column layout on medium screens: poster thumbnail + details
              >
                {credit.posterUrl ? (
                  // If this credit has a poster URL, show the movie thumbnail
                  <SafeImage
                    src={credit.posterUrl}
                    fallbackSrc={FALLBACK_POSTER}
                    alt={credit.title}
                    className="h-20 w-16 rounded-md object-cover"
                    // Small 80×64px poster thumbnail with rounded corners
                  />
                ) : (
                  // If there's no poster URL, show a placeholder clapperboard icon
                  <div className="flex h-20 w-16 items-center justify-center rounded-md bg-black/35">
                    <Clapperboard size={16} className="text-muted" />
                    {/* Grey clapperboard icon as placeholder */}
                  </div>
                )}

                <div>
                  {/* Movie info: title, role, year, rating */}
                  <p className="font-semibold text-white">{credit.title}</p>
                  {/* Movie title in white bold */}
                  <p className="mt-1 text-sm text-muted">{credit.role}</p>
                  {/* Character/role name in grey */}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    {/* Year and rating in a small horizontal row */}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={13} /> {credit.year}
                      {/* Calendar icon + release year */}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart size={13} className="text-primary" /> {credit.rating}/10
                      {/* Heart icon + rating score — heart used as an alternative rating icon */}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-surface/60 p-5 md:p-6">
          {/* Quick Facts sidebar — h-fit prevents it from stretching to fill the full column height */}

          <h2 className="text-lg font-semibold text-white">Quick Facts</h2>

          <div className="mt-4 space-y-4 text-sm">
            {/* Vertical stack of fact cards */}

            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              {/* Age fact card */}
              <p className="text-xs uppercase tracking-wide text-muted">Age</p>
              <p className="mt-1 flex items-center gap-2 text-white">
                <UserRound size={14} className="text-primary" />
                {/* User icon in Netflix-red */}
                {actor.age}
                {/* Actor's current age as a number */}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              {/* Spouse fact card */}
              <p className="text-xs uppercase tracking-wide text-muted">Spouse</p>
              <p className="mt-1 text-white">{actor.spouse}</p>
              {/* Partner/spouse name or "Not publicly disclosed" */}
            </div>

            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              {/* Parents fact card */}
              <p className="text-xs uppercase tracking-wide text-muted">Parents</p>
              <p className="mt-1 text-white">{actor.parents.join(', ')}</p>
              {/* Parents array joined as a comma-separated string */}
            </div>

            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              {/* Social links fact card */}
              <p className="text-xs uppercase tracking-wide text-muted">Social Links</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Wrapping row of social media link badges */}

                {Object.entries(actor.social).map(([key, link]) => (
                  // actor.social is an object like { wikipedia: "...", instagram: "..." }
                  // Object.entries converts it to pairs: [["wikipedia", "..."], ["instagram", "..."]]
                  <a
                    key={key}
                    // Platform name (e.g. "wikipedia") used as key
                    href={link}
                    // Full URL to the actor's social profile
                    target="_blank"
                    // Opens in a new tab
                    rel="noreferrer"
                    // Security: prevents the new page from accessing window.opener
                    className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-white transition hover:border-primary"
                    // Small pill badge; border highlights in Netflix-red on hover
                  >
                    <Link2 size={12} className="text-primary" />
                    {/* Tiny link chain icon in Netflix-red */}
                    {key}
                    {/* Platform label: "wikipedia", "instagram", "x" */}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default ActorPage
// Makes ActorPage available for import in App.jsx
