import { useEffect, useState } from 'react'
import * as api from './tmdbApi'
import { adaptReview } from './catalog'

/**
 * TMDb's real community reviews for one movie, the feed behind For You's
 * comments panel.
 *
 * Same shape as useMovieDetails: fetched on demand for whichever card is
 * active (never for the whole feed) and cached at module scope, so scrolling
 * back up to a card already read doesn't refetch it.
 */
const cache = new Map()

const EMPTY = { reviews: [], total: 0, loading: true }

function fetchReviews(id) {
  const promise = api
    .getMovieReviews(id)
    .then((data) => ({
      reviews: (data.results || []).map(adaptReview).filter(Boolean),
      total: data.total_results ?? (data.results || []).length,
      loading: false
    }))
    .catch(() => ({ reviews: [], total: 0, loading: false }))
  cache.set(id, promise)
  return promise
}

/**
 * Returns `{reviews, total, loading}`. `loading` stays true until the first
 * response for this id lands, so the panel can render skeleton rows instead
 * of flashing its empty state at every title.
 */
export function useMovieReviews(id) {
  const [entry, setEntry] = useState({ id: null, data: null })

  useEffect(() => {
    if (!id) return
    const cached = cache.get(id)
    if (cached && !(cached instanceof Promise)) return
    let alive = true
    const promise = cached || fetchReviews(id)
    promise.then((d) => {
      cache.set(id, d)
      if (alive) setEntry({ id, data: d })
    })
    return () => {
      alive = false
    }
  }, [id])

  if (!id) return { reviews: [], total: 0, loading: false }
  const cached = cache.get(id)
  if (cached && !(cached instanceof Promise)) return cached
  return entry.id === id && entry.data ? entry.data : EMPTY
}
