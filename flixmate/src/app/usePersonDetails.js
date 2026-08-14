import { useEffect, useState } from 'react'
import * as api from './tmdbApi'
import { adaptPerson } from './catalog'

/** Same caching pattern as useMovieDetails.js, for a person's bio + filmography. */
const cache = new Map()

function fetchPerson(id, genreMap) {
  const promise = Promise.all([api.getPerson(id), api.getPersonCredits(id)]).then(([person, credits]) =>
    adaptPerson(person, credits, genreMap)
  )
  cache.set(id, promise)
  return promise
}

/** Returns the person object once loaded for the current `id`, or `null`
 *  while loading / no id (see useMovieDetails.js for the caching pattern). */
export function usePersonDetails(id, genreMap) {
  const [entry, setEntry] = useState({ id: null, person: null })

  useEffect(() => {
    if (!id) return
    const cached = cache.get(id)
    if (cached && !(cached instanceof Promise)) return
    let alive = true
    const promise = cached || fetchPerson(id, genreMap)
    promise.then((p) => {
      cache.set(id, p)
      if (alive) setEntry({ id, person: p })
    })
    return () => {
      alive = false
    }
  }, [id, genreMap])

  const cached = id ? cache.get(id) : null
  if (cached && !(cached instanceof Promise)) return cached
  return entry.id === id ? entry.person : null
}
