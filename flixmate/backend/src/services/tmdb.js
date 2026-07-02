import 'dotenv/config'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY

const tmdbFetch = async (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDb error ${res.status}: ${path}`)
  return res.json()
}

export default tmdbFetch
