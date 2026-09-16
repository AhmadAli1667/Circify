import 'dotenv/config'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY

// Listings don't change second-to-second, and the catalogue bootstrap alone
// fires 9 calls per page load per visitor, so a short TTL cache turns repeat
// traffic into free hits and keeps TMDb's rate limit out of the picture.
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_LIMIT = 500
const cache = new Map()

function cacheKey(path, params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return `${path}?${sorted}`
}

async function requestOnce(url) {
  return fetch(url)
}

const tmdbFetch = async (path, params = {}) => {
  const key = cacheKey(path, params)
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.data

  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  let res = await requestOnce(url.toString())
  if (!res.ok && (res.status === 429 || res.status >= 500)) {
    const retryAfter = Number(res.headers.get('retry-after')) || 0.5
    await new Promise((r) => setTimeout(r, Math.min(retryAfter * 1000, 2000)))
    res = await requestOnce(url.toString())
  }
  if (!res.ok) throw new Error(`TMDb error ${res.status}: ${path}`)

  const data = await res.json()
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value)
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, data })
  return data
}

export default tmdbFetch
