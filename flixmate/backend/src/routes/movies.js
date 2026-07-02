import { Router } from 'express'
import tmdbFetch from '../services/tmdb.js'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}`)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/:id/videos', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/videos`)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/:id/credits', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/credits`)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/:id/providers', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/watch/providers`)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
