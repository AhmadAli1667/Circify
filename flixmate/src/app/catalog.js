/**
 * Adapter between the project's real catalogue (src/data/*) and the shape the
 * mockup screens expect.
 *
 * The mockup shipped 18 fictional films with a single genre, a runtime string
 * and a colour hue on every record. Real data has none of those, so they are
 * derived here — deterministically, so nothing shifts between renders.
 */

import rawMovies from '../data/movies'
import { actors as actorRecords } from '../data/actors'
import { grad, hueFor, initialsOf } from './art'

/** Only the hand-curated wikimedia posters are real artwork worth showing. */
const isRealPoster = (url) => typeof url === 'string' && url.includes('wikimedia.org')

/** Deterministic runtime in the mockup's "2h 18m" format. */
function runtimeFor(movie) {
  const total = 92 + ((movie.id * 17 + movie.title.length * 7) % 68)
  return `${Math.floor(total / 60)}h ${total % 60}m`
}

/** Poster taglines. Keyed by primary genre, with a catch-all fallback. */
const TAGLINES = {
  'Sci-Fi': 'The future remembers.',
  Thriller: 'Trust no one.',
  Drama: 'Some ties never break.',
  Action: 'No brakes. No mercy.',
  Comedy: 'Laugh like no one’s watching.',
  Horror: 'Don’t look back.',
  Romance: 'Love writes its own ending.',
  Animation: 'A world you can feel.',
  Crime: 'Everybody pays.',
  Adventure: 'The map ends here.',
  Mystery: 'Every answer costs something.',
  Fantasy: 'Believe the impossible.',
  Biography: 'The life behind the legend.',
  History: 'It really happened.',
  War: 'No one comes home the same.',
  Music: 'Play it like it’s the last time.'
}

// --- actors ---------------------------------------------------------------

const slugify = (name) => name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()

/**
 * Every distinct billed name in the catalogue becomes an actor. Names with a
 * record in data/actors.js keep their photo and biography; the rest get a
 * generated monogram card and a "biography coming soon" note on their page.
 */
function buildActors(movies) {
  const bySlug = new Map()

  actorRecords.forEach((a) => {
    bySlug.set(a.slug, {
      slug: a.slug,
      name: a.name,
      hue: hueFor(a.name),
      initial: initialsOf(a.name),
      imageUrl: a.imageUrl,
      biography: a.biography || [],
      knownForRole: a.knownForRole,
      age: a.age,
      spouse: a.spouse,
      parents: a.parents || [],
      social: a.social || {},
      movieCredits: a.movieCredits || [],
      hasProfile: true
    })
  })

  movies.forEach((m) => {
    m.leadCast.forEach((name) => {
      const slug = slugify(name)
      if (bySlug.has(slug)) return
      bySlug.set(slug, {
        slug,
        name,
        hue: hueFor(name),
        initial: initialsOf(name),
        imageUrl: null,
        biography: [],
        knownForRole: null,
        movieCredits: [],
        hasProfile: false
      })
    })
  })

  return [...bySlug.values()]
}

// --- movies ---------------------------------------------------------------

const MOVIES = rawMovies.map((m) => {
  const genres = Array.isArray(m.genre) ? m.genre : [m.genre]
  const primary = genres[0]
  return {
    id: m.id,
    title: m.title,
    year: m.year,
    rating: m.rating,
    genre: primary,
    genres,
    director: m.director,
    leadCast: m.leadCast,
    castSlugs: m.leadCast.map(slugify),
    synopsis: m.synopsis,
    trailerLink: m.trailerLink,
    relatedId: m.relatedPrequelSequelId,
    posterUrl: isRealPoster(m.posterUrl) ? m.posterUrl : null,
    hue: hueFor(m.title),
    initial: m.title[0],
    runtime: runtimeFor(m),
    tagline: TAGLINES[primary] || 'Some stories stay with you.',
    // The catalogue is films only — see SERIES_AVAILABLE below.
    kind: 'movie'
  }
})

const ACTORS = buildActors(MOVIES)

const moviesById = new Map(MOVIES.map((m) => [m.id, m]))
const actorsBySlug = new Map(ACTORS.map((a) => [a.slug, a]))

/**
 * Genre chips, derived from what the catalogue actually contains rather than
 * the mockup's hardcoded eight, so every chip returns results.
 */
export const GENRES = [...new Set(MOVIES.flatMap((m) => m.genres))]
  .map((g) => ({ name: g, count: MOVIES.filter((m) => m.genres.includes(g)).length }))
  .filter((g) => g.count >= 3)
  .sort((a, b) => b.count - a.count)
  .map((g) => g.name)

/**
 * The catalogue has no television data, so the Films/Series type filter can't
 * honour a Series selection. The UI keeps the control and reports it as
 * unavailable instead of silently returning an empty grid.
 */
export const SERIES_AVAILABLE = false

export const movies = MOVIES
export const actors = ACTORS
export const getMovie = (id) => moviesById.get(id)
export const getActor = (slug) => actorsBySlug.get(slug)

/** Films a given actor is billed in. */
export const filmsOf = (slug) => MOVIES.filter((m) => m.castSlugs.includes(slug))

/** Convenience for the many places that need the actor's circle fill. */
export const actorGrad = (slug) => {
  const a = actorsBySlug.get(slug)
  return grad(a ? a.hue : 0)
}
