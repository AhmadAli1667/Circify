/**
 * Thin client for the flixmate/backend TMDb proxy (localhost:3001). One
 * function per backend route. No adaptation here, that's catalog.js's job.
 */

const API_BASE = 'http://localhost:3001/api'

async function get(path, params) {
  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export const getTrending = () => get('/trending')
export const getPopular = (page = 1) => get('/discover/popular', { page })
export const getTopRated = (page = 1) => get('/discover/top_rated', { page })
export const getNowPlaying = (page = 1) => get('/discover/now_playing', { page })
export const discoverMovies = (params) => get('/discover', params)
export const getGenres = () => get('/genres')
export const searchMulti = (query) => get('/search', { query })
export const searchCompany = (query) => get('/search/company', { query })

export const getMovie = (id) => get(`/movies/${id}`)
export const getMovieVideos = (id) => get(`/movies/${id}/videos`)
export const getMovieCredits = (id) => get(`/movies/${id}/credits`)
export const getMovieProviders = (id) => get(`/movies/${id}/providers`)
export const getMovieRecommendations = (id) => get(`/movies/${id}/recommendations`)

export const getPerson = (id) => get(`/people/${id}`)
export const getPersonCredits = (id) => get(`/people/${id}/credits`)
