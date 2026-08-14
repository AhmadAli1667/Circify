/**
 * Adapters between raw TMDb shapes (via tmdbApi.js) and the shape the UI
 * expects. Pure functions only: no network calls and no module-level data
 * live here. Two tiers:
 *
 *  - list-tier (`adaptMovie`): everything TMDb's list endpoints give for free
 *    (trending/popular/top_rated/now_playing/search/recommendations/person
 *    credits), enough to render a poster card.
 *  - detail-tier (`adaptMovieDetail` / `adaptPerson`): cast, director,
 *    runtime, trailer, watch providers, biography. Each needs its own
 *    per-id call, so these are fetched on demand (see useMovieDetails.js /
 *    usePersonDetails.js) rather than for the whole catalogue up front.
 */

import { hueFor, initialsOf } from './art'

const IMG = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_IMG = 'https://image.tmdb.org/t/p/w1280'
const PROFILE_IMG = 'https://image.tmdb.org/t/p/w300'

/** TMDb's canonical genre name vs. the short label the UI already uses. */
const GENRE_LABEL = { 'Science Fiction': 'Sci-Fi' }

/** Poster taglines for the rare card with no poster art. Keyed by primary genre. */
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
  Family: 'For the whole house.',
  History: 'It really happened.',
  War: 'No one comes home the same.',
  Music: 'Play it like it’s the last time.',
  Documentary: 'The truth, on record.'
}

/** The catalogue is films only, no TV data behind these routes. */
export const SERIES_AVAILABLE = false

const label = (name) => GENRE_LABEL[name] || name

function formatRuntime(minutes) {
  if (!minutes) return null
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function ageFrom(birthday, deathday) {
  if (!birthday) return null
  const end = deathday ? new Date(deathday) : new Date()
  const start = new Date(birthday)
  let age = end.getFullYear() - start.getFullYear()
  const m = end.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age -= 1
  return age
}

/**
 * List-tier movie shape. Works for any TMDb "movie list" entry (trending,
 * discover, search results, recommendations, or a person's combined_credits),
 * since they all carry the same `genre_ids` + summary fields. Returns
 * `null` for entries with no title/release date, which callers filter out.
 */
export function adaptMovie(m, genreMap) {
  if (!m || !m.title || !m.release_date) return null
  const genres = (m.genre_ids || [])
    .map((id) => genreMap?.[id])
    .filter(Boolean)
    .map(label)
  const primary = genres[0] || 'Film'

  return {
    id: m.id,
    title: m.title,
    year: Number(m.release_date.slice(0, 4)),
    rating: Math.round((m.vote_average || 0) * 10) / 10,
    voteCount: m.vote_count || 0,
    genre: primary,
    genres,
    posterUrl: m.poster_path ? `${IMG}${m.poster_path}` : null,
    backdropUrl: m.backdrop_path ? `${BACKDROP_IMG}${m.backdrop_path}` : null,
    synopsis: m.overview || '',
    popularity: m.popularity || 0,
    hue: hueFor(m.title),
    initial: m.title[0],
    tagline: TAGLINES[primary] || 'Some stories stay with you.',
    kind: 'movie',
    // Always available instantly: a search link, not a real trailer id.
    // Superseded by `trailerKey` (a real YouTube video id) once the detail
    // fetch resolves; kept as the fallback for whichever movie it doesn't.
    trailerLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.title} official trailer`)}`,
    // detail-tier fields, filled in by adaptMovieDetail once fetched
    runtime: null,
    director: null,
    leadCast: [],
    cast: [],
    trailerKey: null,
    providers: null,
    recommendations: null
  }
}

/**
 * Detail-tier fields, merged onto an already-adapted list-tier movie once
 * the per-movie calls resolve (see useMovieDetails.js).
 */
export function adaptMovieDetail({ detail, credits, videos, providers, recommendations, genreMap }) {
  const cast = (credits?.cast || []).slice(0, 8).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character || '',
    imageUrl: c.profile_path ? `${PROFILE_IMG}${c.profile_path}` : null,
    hue: hueFor(c.name),
    initial: initialsOf(c.name)
  }))

  const director = (credits?.crew || []).find((c) => c.job === 'Director')?.name || null

  const vids = (videos?.results || []).filter((v) => v.site === 'YouTube')
  const trailer =
    vids.find((v) => v.type === 'Trailer' && v.official) || vids.find((v) => v.type === 'Trailer') || vids[0]

  const genres = detail?.genres?.length ? detail.genres.map((g) => label(g.name)) : undefined

  return {
    runtime: formatRuntime(detail?.runtime),
    director,
    leadCast: cast.map((c) => c.name),
    cast,
    trailerKey: trailer?.key || null,
    providers: providers?.results?.US || null,
    recommendations: (recommendations?.results || [])
      .map((m) => adaptMovie(m, genreMap))
      .filter(Boolean)
      .slice(0, 12),
    ...(genres ? { genres, genre: genres[0] || 'Film' } : {})
  }
}

/** Person detail + combined credits → the actor page's shape. */
export function adaptPerson(person, credits, genreMap) {
  const filmography = (credits?.cast || [])
    .filter((c) => c.media_type === 'movie')
    .map((m) => adaptMovie(m, genreMap))
    .filter(Boolean)
    .sort((a, b) => b.year - a.year)

  return {
    id: person.id,
    name: person.name,
    imageUrl: person.profile_path ? `${PROFILE_IMG}${person.profile_path}` : null,
    hue: hueFor(person.name),
    initial: initialsOf(person.name),
    biography: person.biography ? person.biography.split(/\n\s*\n/).filter(Boolean) : [],
    knownForRole: person.known_for_department || null,
    birthday: person.birthday || null,
    placeOfBirth: person.place_of_birth || null,
    age: ageFrom(person.birthday, person.deathday),
    social: {},
    filmography
  }
}
