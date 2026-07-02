import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import moviesData from '../data/movies'

const MovieContext = createContext(null)

const STORAGE_KEYS = {
  movies: 'flixmate_movies',
  ratings: 'flixmate_user_ratings',
  watchlist: 'flixmate_watchlist',
  logo: 'flixmate_logo_data_url'
}

const DEFAULT_FILTERS = { yearMin: 1980, yearMax: 2026, minRating: 0, genre: 'All' }

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

const isValidHttpUrl = (value) => /^https?:\/\//i.test(value || '')

const normalizeSearchText = (value) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const mergeSeedMovies = (storedMovies, seedMovies) => {
  if (!Array.isArray(storedMovies) || storedMovies.length === 0) return seedMovies

  const existingKeys = new Set(
    storedMovies.map((movie) => `${String(movie.title || '').toLowerCase()}::${movie.year}`)
  )
  const maxId = storedMovies.reduce((max, movie) => Math.max(max, Number(movie.id) || 0), 0)
  let nextId = maxId + 1

  const missingSeedMovies = seedMovies
    .filter((movie) => !existingKeys.has(`${String(movie.title || '').toLowerCase()}::${movie.year}`))
    .map((movie) => ({ ...movie, id: nextId++ }))

  return [...storedMovies, ...missingSeedMovies]
}

export function MovieProvider({ children }) {
  const [movies, setMovies] = useState(() => mergeSeedMovies(readJSON(STORAGE_KEYS.movies, null), moviesData))
  const [ratings, setRatings] = useState(() => readJSON(STORAGE_KEYS.ratings, {}))
  const [watchlist, setWatchlist] = useState(() => readJSON(STORAGE_KEYS.watchlist, []))
  const [logoDataUrl, setLogoDataUrl] = useState(() => localStorage.getItem(STORAGE_KEYS.logo) || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(movies)) }, [movies])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings)) }, [ratings])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist)) }, [watchlist])
  useEffect(() => {
    if (logoDataUrl) localStorage.setItem(STORAGE_KEYS.logo, logoDataUrl)
    else localStorage.removeItem(STORAGE_KEYS.logo)
  }, [logoDataUrl])

  const updateFilter = useCallback((field, value) => setFilters((prev) => ({ ...prev, [field]: value })), [])
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])
  const rateMovie = useCallback((movieId, value) => setRatings((prev) => ({ ...prev, [movieId]: value })), [])
  const toggleWatchlist = useCallback((movieId) =>
    setWatchlist((prev) => prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]), [])

  const addMovie = useCallback((movieInput) => {
    const rating = Number(movieInput.rating)
    const year = Number(movieInput.year)
    const genre = Array.isArray(movieInput.genre) ? movieInput.genre : []
    const leadCast = Array.isArray(movieInput.leadCast) ? movieInput.leadCast : []

    if (!movieInput.title?.trim()) return { ok: false, error: 'Title is required.' }
    if (!movieInput.director?.trim()) return { ok: false, error: 'Director is required.' }
    if (!movieInput.synopsis?.trim()) return { ok: false, error: 'Synopsis is required.' }
    if (!genre.length) return { ok: false, error: 'At least one genre is required.' }
    if (!leadCast.length) return { ok: false, error: 'At least one lead cast member is required.' }
    if (Number.isNaN(rating) || rating < 0 || rating > 10) return { ok: false, error: 'Rating must be between 0 and 10.' }
    if (Number.isNaN(year) || year < 1900 || year > 2026) return { ok: false, error: 'Year must be between 1900 and 2026.' }
    if (!isValidHttpUrl(movieInput.posterUrl)) return { ok: false, error: 'Poster URL must start with http:// or https://.' }
    if (!isValidHttpUrl(movieInput.trailerLink)) return { ok: false, error: 'Trailer link must start with http:// or https://.' }

    setMovies((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((m) => m.id)) + 1 : 1
      return [{ id: nextId, title: movieInput.title.trim(), genre, director: movieInput.director.trim(), leadCast, rating, year, synopsis: movieInput.synopsis.trim(), posterUrl: movieInput.posterUrl.trim(), trailerLink: movieInput.trailerLink.trim(), relatedPrequelSequelId: movieInput.relatedPrequelSequelId ? Number(movieInput.relatedPrequelSequelId) : null }, ...prev]
    })
    return { ok: true }
  }, [])

  const deleteMovie = useCallback((movieId) => {
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId))
    setWatchlist((prev) => prev.filter((id) => id !== movieId))
    setRatings((prev) => { const c = { ...prev }; delete c[movieId]; return c })
  }, [])

  const getEffectiveRating = useCallback((movie) => {
    const userRating = ratings[movie.id]
    return userRating ? Number(userRating) : Number(movie.rating)
  }, [ratings])

  const filteredMovies = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery)
    const queryTokens = normalizedQuery ? normalizedQuery.split(' ') : []

    return movies.filter((movie) => {
      if (movie.year < filters.yearMin || movie.year > filters.yearMax) return false
      if (getEffectiveRating(movie) < filters.minRating) return false
      if (filters.genre !== 'All' && !movie.genre.includes(filters.genre)) return false
      if (!queryTokens.length) return true

      const blob = normalizeSearchText([movie.title, movie.director, movie.genre.join(' '), movie.leadCast.join(' '), movie.synopsis, movie.year].join(' '))
      return queryTokens.every((token) => blob.includes(token))
    })
  }, [movies, searchQuery, filters, getEffectiveRating])

  const genres = useMemo(() => {
    const unique = new Set()
    movies.forEach((movie) => movie.genre.forEach((g) => unique.add(g)))
    return ['All', ...Array.from(unique).sort()]
  }, [movies])

  const rows = useMemo(() => {
    const byRating = [...filteredMovies].sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a))
    const byRecency = [...filteredMovies].sort((a, b) => b.year - a.year)
    return [
      { title: 'Trending Now', movies: byRecency.slice(0, 14) },
      { title: 'Top Rated', movies: byRating.slice(0, 14) },
      { title: 'Action Boost', movies: filteredMovies.filter((m) => m.genre.includes('Action')).slice(0, 14) },
      { title: 'Sci-Fi Spectrum', movies: filteredMovies.filter((m) => m.genre.includes('Sci-Fi')).slice(0, 14) },
      { title: 'Crime Pulse', movies: filteredMovies.filter((m) => m.genre.includes('Crime')).slice(0, 14) },
      { title: 'Drama Essentials', movies: filteredMovies.filter((m) => m.genre.includes('Drama')).slice(0, 14) }
    ]
  }, [filteredMovies, getEffectiveRating])

  const getSmartRecs = useCallback((movieId) => {
    const source = movies.find((movie) => movie.id === movieId)
    if (!source) return []

    const sourceGenres = new Set(source.genre)
    const sourceCast = new Set(source.leadCast)

    return movies
      .filter((movie) => movie.id !== movieId)
      .map((movie) => {
        let score = 0
        movie.genre.forEach((g) => { if (sourceGenres.has(g)) score += 3 })
        if (movie.director === source.director) score += 2
        movie.leadCast.forEach((actor) => { if (sourceCast.has(actor)) score += 2 })
        if (movie.relatedPrequelSequelId === source.id || source.relatedPrequelSequelId === movie.id) score += 3
        return { ...movie, _score: score }
      })
      .filter((movie) => movie._score > 0)
      .sort((a, b) => b._score - a._score || b.year - a.year)
      .slice(0, 6)
  }, [movies])

  const exportBackup = useCallback(() =>
    JSON.stringify({ movies, ratings, watchlist, logoDataUrl, exportedAt: new Date().toISOString() }, null, 2),
    [movies, ratings, watchlist, logoDataUrl])

  const importBackup = useCallback((backupText) => {
    try {
      const data = JSON.parse(backupText)
      if (!Array.isArray(data.movies) || typeof data.ratings !== 'object' || !Array.isArray(data.watchlist))
        return { ok: false, error: 'Backup format is invalid.' }
      setMovies(data.movies)
      setRatings(data.ratings || {})
      setWatchlist(data.watchlist || [])
      setLogoDataUrl(typeof data.logoDataUrl === 'string' ? data.logoDataUrl : '')
      return { ok: true }
    } catch { return { ok: false, error: 'Could not parse backup JSON.' } }
  }, [])

  const stats = useMemo(() => ({
    movieCount: movies.length,
    ratedCount: Object.keys(ratings).length,
    watchlistCount: watchlist.length,
    avgRating: movies.length
      ? (movies.reduce((sum, movie) => sum + getEffectiveRating(movie), 0) / movies.length).toFixed(2)
      : '0.00'
  }), [movies, ratings, watchlist, getEffectiveRating])

  const value = useMemo(() => ({
    movies, filteredMovies, rows, ratings, watchlist, genres, logoDataUrl,
    searchQuery, filters, setSearchQuery, updateFilter, resetFilters, setLogoDataUrl,
    rateMovie, toggleWatchlist, addMovie, deleteMovie, getSmartRecs,
    getEffectiveRating, exportBackup, importBackup, stats
  }), [movies, filteredMovies, rows, ratings, watchlist, genres, logoDataUrl, searchQuery, filters, updateFilter, resetFilters, rateMovie, toggleWatchlist, addMovie, deleteMovie, getSmartRecs, getEffectiveRating, exportBackup, importBackup, stats])

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
}

export function useMovies() {
  const ctx = useContext(MovieContext)
  if (!ctx) throw new Error('useMovies must be used within MovieProvider')
  return ctx
}
