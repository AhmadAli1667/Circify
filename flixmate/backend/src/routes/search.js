import { Router } from 'express'
import tmdbFetch from '../services/tmdb.js'

const router = Router()

router.get('/', async (req, res) => {
  const query = req.query.query
  if (!query) return res.status(400).json({ error: 'query param required' })
  try {
    const data = await tmdbFetch('/search/multi', { query, include_adult: false })
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
