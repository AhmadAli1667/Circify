import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
// createContext — creates the shared movie state container
// useCallback — memoizes functions so their reference only changes when dependencies change
// useContext — reads from the context inside any component
// useEffect — runs side effects (localStorage sync) after state changes
// useMemo — memoizes computed values (filteredMovies, rows, stats) that depend on state
// useState — holds all mutable state: movies, ratings, watchlist, logo, search, filters

import moviesData from '../data/movies'
// The default 136-movie dataset; used as the seed when no localStorage data exists

const MovieContext = createContext(null)
// Creates the context object; null is the default value before the Provider wraps the tree

const STORAGE_KEYS = {
  // Object mapping human-readable names to localStorage key strings
  // Centralizing keys prevents typos when reading/writing to localStorage
  movies: 'flixmate_movies',
  // Key for the full movie array
  ratings: 'flixmate_user_ratings',
  // Key for the user's personal ratings object { movieId: ratingValue }
  watchlist: 'flixmate_watchlist',
  // Key for the watchlist array of movie IDs
  logo: 'flixmate_logo_data_url'
  // Key for the custom logo base64 string
}

const DEFAULT_FILTERS = {
  // The initial/reset state for all filter sliders and dropdowns
  yearMin: 1980,
  // Minimum release year — starts at 1980 to exclude very old films
  yearMax: 2026,
  // Maximum release year — current year; includes all movies up to now
  minRating: 0,
  // Minimum rating threshold — 0 means show all movies regardless of rating
  genre: 'All'
  // 'All' means no genre filter is applied
}

const readJSON = (key, fallback) => {
  // Helper to safely read and parse JSON from localStorage
  // key: the localStorage key string
  // fallback: value to return if the key doesn't exist or the JSON is invalid
  try {
    const raw = localStorage.getItem(key)
    // Reads the raw string from localStorage; returns null if the key doesn't exist

    return raw ? JSON.parse(raw) : fallback
    // Parses JSON if data exists; returns fallback for null/undefined
  } catch {
    return fallback
    // Returns fallback if JSON.parse throws (malformed data)
  }
}

const isValidHttpUrl = (value) => /^https?:\/\//i.test(value || '')
// Validates that a URL starts with "http://" or "https://"
// The regex: ^https?:\/\/ matches "http://" or "https://" at the start of the string
// /i flag: case-insensitive — accepts "HTTP://" as well
// (value || '') guards against null/undefined inputs

const normalizeSearchText = (value) =>
  // Cleans and standardizes text for search comparison
  // Returns a lowercase string with only letters/numbers/spaces
  String(value || '')
    // Converts to string; handles null/undefined/number inputs
    .toLowerCase()
    // Makes comparison case-insensitive ("Action" matches "action")
    .replace(/[^a-z0-9\s]/g, ' ')
    // Replaces punctuation (hyphens, colons, quotes) with spaces
    .replace(/\s+/g, ' ')
    // Collapses multiple consecutive spaces into one
    .trim()
    // Removes leading and trailing whitespace

const mergeSeedMovies = (storedMovies, seedMovies) => {
  // Ensures new movies added to movies.js show up for existing users
  // Without this, once a user has localStorage data the seed is never re-read
  // storedMovies: movies previously saved in localStorage (may be stale/shorter)
  // seedMovies: the current full movies array from movies.js

  if (!Array.isArray(storedMovies) || storedMovies.length === 0) {
    // If localStorage has no movies (first visit or cleared storage), use the full seed
    return seedMovies
  }

  const existingKeys = new Set(
    // Creates a Set of "title::year" strings to check for existing movies
    storedMovies.map((movie) => `${String(movie.title || '').toLowerCase()}::${movie.year}`)
    // Normalizes title to lowercase to handle case inconsistencies
  )

  const maxId = storedMovies.reduce((max, movie) => Math.max(max, Number(movie.id) || 0), 0)
  // Finds the highest existing movie ID — new movies get IDs above this value
  // Number() conversion handles IDs that might be stored as strings

  let nextId = maxId + 1
  // Starting ID for any new seed movies not yet in localStorage

  const missingSeedMovies = seedMovies
    .filter((movie) => {
      // Finds seed movies that don't already exist in localStorage
      const key = `${String(movie.title || '').toLowerCase()}::${movie.year}`
      return !existingKeys.has(key)
      // Returns true (keep) if this movie isn't already stored
    })
    .map((movie) => ({ ...movie, id: nextId++ }))
    // Assigns the next available ID to each new movie; nextId increments for each

  return [...storedMovies, ...missingSeedMovies]
  // Returns stored movies first (preserves user edits/additions) + any new seed movies appended
}

export function MovieProvider({ children }) {
  // The context provider component — holds all movie-related state and logic

  const [movies, setMovies] = useState(() => {
    // Lazy initializer: reads from localStorage on mount, merges with seed data
    const storedMovies = readJSON(STORAGE_KEYS.movies, null)
    // null fallback means "no stored movies" — triggers full seed return in mergeSeedMovies
    return mergeSeedMovies(storedMovies, moviesData)
    // Returns the merged final movie list
  })

  const [ratings, setRatings] = useState(() => readJSON(STORAGE_KEYS.ratings, {}))
  // Lazy initializer: loads saved user ratings; defaults to empty object if none saved

  const [watchlist, setWatchlist] = useState(() => readJSON(STORAGE_KEYS.watchlist, []))
  // Lazy initializer: loads saved watchlist; defaults to empty array if none saved

  const [logoDataUrl, setLogoDataUrl] = useState(() => localStorage.getItem(STORAGE_KEYS.logo) || '')
  // Loads the custom logo data URL from localStorage; '' means use the text logo

  const [searchQuery, setSearchQuery] = useState('')
  // The current text in the Navbar search input — empty string shows all movies

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  // The current state of all discovery wizard filter controls

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.movies, JSON.stringify(movies))
    // Syncs the movies array to localStorage whenever it changes
    // JSON.stringify serializes the array to a string for storage
  }, [movies])
  // Runs after every state update where movies changes

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings))
    // Syncs user ratings to localStorage whenever they change
  }, [ratings])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist))
    // Syncs the watchlist array to localStorage whenever it changes
  }, [watchlist])

  useEffect(() => {
    if (logoDataUrl) {
      localStorage.setItem(STORAGE_KEYS.logo, logoDataUrl)
      // Saves the base64 logo string when it has a value
    } else {
      localStorage.removeItem(STORAGE_KEYS.logo)
      // Removes the logo key entirely when it's cleared (empty string)
    }
  }, [logoDataUrl])
  // Runs whenever the logo changes (upload or clear)

  const updateFilter = useCallback((field, value) => {
    // Updates a single filter field without touching the others
    // field: one of 'yearMin', 'yearMax', 'minRating', 'genre'
    // value: the new value for that field
    setFilters((prev) => ({ ...prev, [field]: value }))
    // Spreads previous filter state and overwrites only the changed field
    // Computed property [field] dynamically targets the right key
  }, [])
  // No dependencies: setFilters is stable; this function never needs to be recreated

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    // Replaces the entire filters state with the default values object
  }, [])
  // No dependencies: DEFAULT_FILTERS is a module-level constant; always stable

  const rateMovie = useCallback((movieId, value) => {
    // Saves a rating for a specific movie
    // movieId: the numeric ID of the movie being rated
    // value: the rating value (2, 4, 6, 8, or 10 from the 1-5 star widget)
    setRatings((prev) => ({ ...prev, [movieId]: value }))
    // Adds or updates the rating entry for this movieId in the ratings object
  }, [])

  const toggleWatchlist = useCallback((movieId) => {
    // Adds a movie to the watchlist if it's not there; removes it if it is
    setWatchlist((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
      // If movieId is in the list: filter it out (remove)
      // If not in the list: spread the existing array and append the new ID
    )
  }, [])

  const addMovie = useCallback((movieInput) => {
    // Validates and adds a new movie to the movies array
    // Returns { ok: true } on success or { ok: false, error: string } on validation failure

    const rating = Number(movieInput.rating)
    // Converts the rating string from the form input to a number

    const year = Number(movieInput.year)
    // Converts the year string from the form input to a number

    const genre = Array.isArray(movieInput.genre) ? movieInput.genre : []
    // Ensures genre is always an array; handles the case where it wasn't split yet

    const leadCast = Array.isArray(movieInput.leadCast) ? movieInput.leadCast : []
    // Ensures leadCast is always an array

    if (!movieInput.title?.trim()) {
      return { ok: false, error: 'Title is required.' }
      // Rejects if title is empty or only whitespace
    }
    if (!movieInput.director?.trim()) {
      return { ok: false, error: 'Director is required.' }
      // Rejects if director name is empty
    }
    if (!movieInput.synopsis?.trim()) {
      return { ok: false, error: 'Synopsis is required.' }
      // Rejects if synopsis is empty
    }
    if (!genre.length) {
      return { ok: false, error: 'At least one genre is required.' }
      // Rejects if no genres were provided
    }
    if (!leadCast.length) {
      return { ok: false, error: 'At least one lead cast member is required.' }
      // Rejects if no cast members were provided
    }
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      return { ok: false, error: 'Rating must be between 0 and 10.' }
      // Rejects if rating is not a number or out of the 0–10 range
    }
    if (Number.isNaN(year) || year < 1900 || year > 2026) {
      return { ok: false, error: 'Year must be between 1900 and 2026.' }
      // Rejects if year is not a number or out of the valid range
    }
    if (!isValidHttpUrl(movieInput.posterUrl)) {
      return { ok: false, error: 'Poster URL must start with http:// or https://.' }
      // Rejects if the poster URL doesn't look like a real URL
    }
    if (!isValidHttpUrl(movieInput.trailerLink)) {
      return { ok: false, error: 'Trailer link must start with http:// or https://.' }
      // Rejects if the trailer link doesn't look like a real URL
    }

    setMovies((prev) => {
      // Updates the movies array with the new movie prepended at the front
      const nextId = prev.length ? Math.max(...prev.map((m) => m.id)) + 1 : 1
      // Finds the current max ID and adds 1; starts at 1 if the movies array is empty

      const cleanMovie = {
        // Builds the final movie object from validated input
        id: nextId,
        title: movieInput.title.trim(),
        // Trims whitespace from both ends of the title
        genre,
        // Already an array from the validation step above
        director: movieInput.director.trim(),
        leadCast,
        // Already an array from the validation step above
        rating,
        // Already converted to a number
        year,
        // Already converted to a number
        synopsis: movieInput.synopsis.trim(),
        posterUrl: movieInput.posterUrl.trim(),
        trailerLink: movieInput.trailerLink.trim(),
        relatedPrequelSequelId: movieInput.relatedPrequelSequelId ? Number(movieInput.relatedPrequelSequelId) : null
        // Converts the selected dropdown value to a number, or null if none selected
      }
      return [cleanMovie, ...prev]
      // Prepends the new movie to the array — it appears first in all views
    })

    return { ok: true }
    // Signals success to the caller (AdminDashboard) to show confirmation and reset the form
  }, [])

  const deleteMovie = useCallback((movieId) => {
    // Removes a movie from the database and cleans up all associated user data
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId))
    // Removes the movie from the main array

    setWatchlist((prev) => prev.filter((id) => id !== movieId))
    // Also removes the movie ID from the watchlist if it was saved there

    setRatings((prev) => {
      // Also removes the user's rating for this movie
      const cloned = { ...prev }
      // Creates a shallow copy to avoid mutating the original object directly
      delete cloned[movieId]
      // Deletes the rating entry for this specific movie ID
      return cloned
    })
  }, [])

  const getEffectiveRating = useCallback(
    (movie) => {
      // Returns the display rating for a movie: user's rating if set, otherwise movie's default
      const userRating = ratings[movie.id]
      // Checks if the user has rated this movie
      return userRating ? Number(userRating) : Number(movie.rating)
      // Converts to Number for consistent type — ratings in localStorage are sometimes stored as strings
    },
    [ratings]
    // Re-creates when ratings change so it reflects the latest user input
  )

  const filteredMovies = useMemo(() => {
    // Computes the list of movies that match the current search query and all active filters
    const normalizedQuery = normalizeSearchText(searchQuery)
    // Normalizes the search text: lowercase, remove punctuation, trim

    const queryTokens = normalizedQuery ? normalizedQuery.split(' ') : []
    // Splits the search query into individual words; empty array if no search query
    // This enables multi-word search: "dark knight" matches movies containing both words

    return movies.filter((movie) => {
      // Returns only movies that pass ALL filter checks

      const inYearRange = movie.year >= filters.yearMin && movie.year <= filters.yearMax
      // Checks if the movie's year falls within the selected year range

      const ratingOk = getEffectiveRating(movie) >= filters.minRating
      // Checks if the movie's effective rating meets the minimum threshold

      const genreOk = filters.genre === 'All' || movie.genre.includes(filters.genre)
      // If genre is 'All', pass all movies; otherwise check if the movie has the selected genre

      if (!inYearRange || !ratingOk || !genreOk) {
        return false
        // Short-circuit: if any filter fails, exclude this movie immediately
      }

      if (!queryTokens.length) {
        return true
        // If there's no search query, the movie passes all remaining checks
      }

      const movieSearchBlob = normalizeSearchText(
        // Builds a single normalized text string from all searchable movie fields
        [
          movie.title,
          movie.director,
          movie.genre.join(' '),
          // Converts the genre array to a space-separated string
          movie.leadCast.join(' '),
          // Converts the cast array to a space-separated string
          movie.synopsis,
          movie.year
          // Allows searching by year number (e.g. typing "1994" finds movies from 1994)
        ].join(' ')
        // Joins all fields into one long string for unified search
      )

      return queryTokens.every((token) => movieSearchBlob.includes(token))
      // ALL search tokens must be present in the movie blob
      // Example: "nolan action" matches movies with both "nolan" and "action" in any fields
    })
  }, [movies, searchQuery, filters, getEffectiveRating])
  // Recalculates whenever movies, search, filters, or ratings change

  const genres = useMemo(() => {
    // Builds the sorted list of all unique genres for the genre dropdown
    const unique = new Set()
    // Set automatically removes duplicates
    movies.forEach((movie) => movie.genre.forEach((g) => unique.add(g)))
    // Iterates all movies and all genres within each movie, adding each to the Set
    return ['All', ...Array.from(unique).sort()]
    // Prepends 'All' as the first option; sorts the rest alphabetically
  }, [movies])
  // Only recalculates when the movies array changes

  const rows = useMemo(() => {
    // Builds the 6 categorized movie rows displayed on the home page
    const byRating = [...filteredMovies].sort((a, b) => getEffectiveRating(b) - getEffectiveRating(a))
    // Creates a rating-sorted copy — used for Top Rated row

    const byRecency = [...filteredMovies].sort((a, b) => b.year - a.year)
    // Creates a year-sorted copy (newest first) — used for Trending Now row

    return [
      { title: 'Trending Now', movies: byRecency.slice(0, 14) },
      // 14 most recently released movies in the filtered set
      { title: 'Top Rated', movies: byRating.slice(0, 14) },
      // 14 highest-rated movies in the filtered set
      { title: 'Action Boost', movies: filteredMovies.filter((m) => m.genre.includes('Action')).slice(0, 14) },
      // Up to 14 action movies from the filtered set
      { title: 'Sci-Fi Spectrum', movies: filteredMovies.filter((m) => m.genre.includes('Sci-Fi')).slice(0, 14) },
      // Up to 14 sci-fi movies from the filtered set
      { title: 'Crime Pulse', movies: filteredMovies.filter((m) => m.genre.includes('Crime')).slice(0, 14) },
      // Up to 14 crime movies from the filtered set
      { title: 'Drama Essentials', movies: filteredMovies.filter((m) => m.genre.includes('Drama')).slice(0, 14) }
      // Up to 14 drama movies from the filtered set
    ]
  }, [filteredMovies, getEffectiveRating])
  // Recalculates when filteredMovies or ratings change

  const getSmartRecs = useCallback(
    (movieId) => {
      // Returns up to 6 similar movies scored by shared attributes
      // Higher score = more similar to the source movie

      const source = movies.find((movie) => movie.id === movieId)
      // Finds the source movie object from its ID
      if (!source) {
        return []
        // Returns empty if the movie ID doesn't exist
      }

      const sourceGenres = new Set(source.genre)
      // Creates a Set of the source movie's genres for O(1) lookup

      const sourceCast = new Set(source.leadCast)
      // Creates a Set of the source movie's cast members for O(1) lookup

      return movies
        .filter((movie) => movie.id !== movieId)
        // Excludes the source movie itself from recommendations

        .map((movie) => {
          // Scores each other movie based on similarity

          let score = 0
          // Starts at 0 — movies with no shared attributes won't appear

          movie.genre.forEach((genre) => {
            if (sourceGenres.has(genre)) {
              score += 3
              // +3 for each shared genre — genre similarity is the strongest signal
            }
          })

          if (movie.director === source.director) {
            score += 2
            // +2 for same director — same filmmaker means similar style/tone
          }

          movie.leadCast.forEach((actor) => {
            if (sourceCast.has(actor)) {
              score += 2
              // +2 for each shared cast member — shared actors suggest related stories
            }
          })

          if (movie.relatedPrequelSequelId === source.id || source.relatedPrequelSequelId === movie.id) {
            score += 3
            // +3 if one is the prequel/sequel of the other — strongest direct relation
          }

          return { ...movie, _score: score }
          // Returns a copy of the movie with the computed similarity score attached
        })
        .filter((movie) => movie._score > 0)
        // Excludes movies with zero similarity (no shared attributes)

        .sort((a, b) => b._score - a._score || b.year - a.year)
        // Primary sort: highest score first; secondary: newest first as tiebreaker

        .slice(0, 6)
        // Returns at most 6 recommendations
    },
    [movies]
    // Re-creates when the movies array changes
  )

  const exportBackup = useCallback(() => {
    // Serializes all app state to a formatted JSON string for download
    return JSON.stringify(
      {
        movies,
        // The full movies array including any user-added movies
        ratings,
        // All user ratings as { movieId: value }
        watchlist,
        // Array of watchlisted movie IDs
        logoDataUrl,
        // The custom logo as a base64 data URL (or empty string)
        exportedAt: new Date().toISOString()
        // ISO timestamp of when the backup was created — useful for version tracking
      },
      null,
      2
      // null replacer (no filtering) + 2-space indent for human-readable JSON
    )
  }, [movies, ratings, watchlist, logoDataUrl])
  // Recreates when any of the exported values change

  const importBackup = useCallback((backupText) => {
    // Parses and restores app state from a backup JSON string
    // backupText: raw string content of the uploaded .json file
    try {
      const data = JSON.parse(backupText)
      // Parses the JSON string — throws if malformed

      if (!Array.isArray(data.movies) || typeof data.ratings !== 'object' || !Array.isArray(data.watchlist)) {
        return { ok: false, error: 'Backup format is invalid.' }
        // Validates the essential shape of the backup — prevents broken imports
      }

      setMovies(data.movies)
      // Restores the movies array

      setRatings(data.ratings || {})
      // Restores ratings; falls back to empty object if missing from backup

      setWatchlist(data.watchlist || [])
      // Restores watchlist; falls back to empty array if missing

      setLogoDataUrl(typeof data.logoDataUrl === 'string' ? data.logoDataUrl : '')
      // Restores logo if it's a string; clears it if absent or wrong type

      return { ok: true }
      // Signals successful import to the caller
    } catch {
      return { ok: false, error: 'Could not parse backup JSON.' }
      // Returns a user-friendly error if JSON.parse failed
    }
  }, [])
  // No dependencies — setMovies etc. are stable React state setters

  const stats = useMemo(() => {
    // Computes dashboard statistics shown in the Admin Branding Manager section
    const ratedCount = Object.keys(ratings).length
    // Counts how many movie IDs exist in the ratings object

    const watchlistCount = watchlist.length
    // Number of movies in the watchlist array

    const avgRating = movies.length
      ? (movies.reduce((sum, movie) => sum + getEffectiveRating(movie), 0) / movies.length).toFixed(2)
      // Calculates the mean effective rating across all movies; toFixed(2) = 2 decimal places
      : '0.00'
      // Returns '0.00' if there are no movies to avoid division by zero

    return {
      movieCount: movies.length,
      // Total number of movies in the database
      ratedCount,
      watchlistCount,
      avgRating
    }
  }, [movies, ratings, watchlist, getEffectiveRating])
  // Recalculates when movies, ratings, or watchlist change

  const value = useMemo(
    // Creates the context value object — memoized to prevent unnecessary re-renders
    () => ({
      movies,
      // The full unfiltered movie array
      filteredMovies,
      // Movies after search + filter processing
      rows,
      // The 6 categorized movie rows for the home page
      ratings,
      // User's personal ratings { movieId: value }
      watchlist,
      // Array of bookmarked movie IDs
      genres,
      // Sorted array of all unique genres with 'All' prepended
      logoDataUrl,
      // Custom logo base64 string (empty = use text logo)
      searchQuery,
      // Current text in the search input
      filters,
      // Current state of all filter sliders/selects
      setSearchQuery,
      // Directly exposes the search setter — used by Navbar
      updateFilter,
      // Function to update one filter field
      resetFilters,
      // Function to reset all filters to defaults
      setLogoDataUrl,
      // Function to update the logo (used by admin)
      rateMovie,
      // Function to save a rating for a movie
      toggleWatchlist,
      // Function to add/remove a movie from the watchlist
      addMovie,
      // Function to add a new movie with validation
      deleteMovie,
      // Function to delete a movie and clean up its ratings/watchlist
      getSmartRecs,
      // Function returning similar movie recommendations for a given movie ID
      getEffectiveRating,
      // Function returning user rating or default rating for a movie
      exportBackup,
      // Function returning a JSON string of all app state
      importBackup,
      // Function to restore state from a JSON backup string
      stats
      // Object with movieCount, ratedCount, watchlistCount, avgRating
    }),
    [
      movies,
      filteredMovies,
      rows,
      ratings,
      watchlist,
      genres,
      logoDataUrl,
      searchQuery,
      filters,
      updateFilter,
      resetFilters,
      setLogoDataUrl,
      rateMovie,
      toggleWatchlist,
      addMovie,
      deleteMovie,
      getSmartRecs,
      getEffectiveRating,
      exportBackup,
      importBackup,
      stats
      // All values and functions listed — useMemo only recreates the object when any of these change
    ]
  )

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  // Renders the Provider wrapping all child components with the computed movie context value
}

export function useMovies() {
  // Custom hook — any component imports and calls this to access all movie state and functions

  const ctx = useContext(MovieContext)
  // Reads the current context value from MovieContext

  if (!ctx) {
    // Safety check: if null, the hook was used outside the MovieProvider tree
    throw new Error('useMovies must be used within MovieProvider')
    // Descriptive error message to help developers debug misuse
  }
  return ctx
  // Returns the full context value object with all state and functions
}
