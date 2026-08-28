import { Router } from 'express'
import tmdbFetch from '../services/tmdb.js'
import { getMovieKeywords } from '../services/keywords.js'

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

router.get('/:id/recommendations', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/recommendations`)
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

router.get('/:id/keywords', async (req, res) => {
  try {
    res.json(await getMovieKeywords(Number(req.params.id)))
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

/**
 * TMDb's own community reviews for a title: author, avatar, star rating out
 * of 10, body text, timestamp. Paginated, `page` passes straight through.
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/reviews`, { page: req.query.page || 1 })
    res.json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
