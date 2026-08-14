import { Router } from 'express'
import tmdbFetch from '../services/tmdb.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const data = await tmdbFetch('/genre/movie/list')
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
