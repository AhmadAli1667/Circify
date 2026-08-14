import { useEffect, useState } from 'react'
import * as api from './tmdbApi'
import { adaptMovieDetail } from './catalog'

/**
 * Detail-tier data for one movie: cast, director, runtime, trailer,
 * watch providers, recommendations. Fetched on demand (not for the whole
 * catalogue) and cached at module scope so repeat opens within a session
 * don't refetch.
 */
const cache = new Map()

function fetchDetail(id, genreMap) {
  const promise = Promise.all([
    api.getMovie(id),
    api.getMovieCredits(id),
    api.getMovieVideos(id),
    api.getMovieProviders(id),
    api.getMovieRecommendations(id)
  ]).then(([detail, credits, videos, providers, recommendations]) =>
    adaptMovieDetail({ detail, credits, videos, providers, recommendations, genreMap })
  )
  cache.set(id, promise)
  return promise
}

/**
 * Returns the detail object once loaded for the current `id`, or `null`
 * while loading / no id. An already-resolved cache entry is read straight
 * from render (no state update needed); the effect only handles the async
 * fetch-and-subscribe path.
 */
export function useMovieDetails(id, genreMap) {
  const [entry, setEntry] = useState({ id: null, detail: null })

  useEffect(() => {
    if (!id) return
    const cached = cache.get(id)
    if (cached && !(cached instanceof Promise)) return
    let alive = true
    const promise = cached || fetchDetail(id, genreMap)
    promise.then((d) => {
      cache.set(id, d)
      if (alive) setEntry({ id, detail: d })
    })
    return () => {
      alive = false
    }
  }, [id, genreMap])

  const cached = id ? cache.get(id) : null
  if (cached && !(cached instanceof Promise)) return cached
  return entry.id === id ? entry.detail : null
}
