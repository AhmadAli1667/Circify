import { useEffect, useState } from 'react'
import * as api from './tmdbApi'

/**
 * US watch-provider availability for one movie, on its own rather than
 * bundled into useMovieDetails: places that just need the provider badges
 * (a Theatres grid of six cards) shouldn't also pay for credits, videos and
 * recommendations per card.
 */
const cache = new Map()

function fetchProviders(id) {
  const promise = api
    .getMovieProviders(id)
    .then((data) => data?.results?.US || null)
    .catch(() => null)
  cache.set(id, promise)
  return promise
}

export function useMovieProviders(id) {
  const [entry, setEntry] = useState({ id: null, providers: null })

  useEffect(() => {
    if (!id) return
    const cached = cache.get(id)
    if (cached && !(cached instanceof Promise)) return
    let alive = true
    const promise = cached || fetchProviders(id)
    promise.then((p) => {
      cache.set(id, p)
      if (alive) setEntry({ id, providers: p })
    })
    return () => {
      alive = false
    }
  }, [id])

  const cached = id ? cache.get(id) : null
  if (cached && !(cached instanceof Promise)) return cached
  return entry.id === id ? entry.providers : null
}
