import { Router } from 'express'
import tmdbFetch from '../services/tmdb.js'

const router = Router()

/** Whitelisted passthrough params for TMDb's /discover/movie. */
const DISCOVER_PARAMS = ['page', 'with_genres', 'with_companies', 'sort_by', 'primary_release_year']

router.get('/', async (req, res) => {
  try {
    const params = {}
    for (const key of DISCOVER_PARAMS) {
      if (req.query[key] !== undefined) params[key] = req.query[key]
    }
    if (!params.sort_by) params.sort_by = 'popularity.desc'
    const data = await tmdbFetch('/discover/movie', params)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/popular', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/popular', { page: req.query.page || 1 })
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/top_rated', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/top_rated', { page: req.query.page || 1 })
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/now_playing', async (req, res) => {
  try {
    const data = await tmdbFetch('/movie/now_playing', { page: req.query.page || 1 })
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
