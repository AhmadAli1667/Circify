import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('watchlist')
    .select('movie_id')
    .order('added_at', { ascending: false })
  if (error) return res.status(502).json({ error: error.message })
  res.json(data.map((r) => r.movie_id))
})

router.post('/:movieId', async (req, res) => {
  const { error } = await req.supabase
    .from('watchlist')
    .upsert({ user_id: req.user.id, movie_id: Number(req.params.movieId) }, { onConflict: 'user_id,movie_id' })
  if (error) return res.status(502).json({ error: error.message })
  res.status(204).end()
})

router.delete('/:movieId', async (req, res) => {
  const { error } = await req.supabase.from('watchlist').delete().eq('movie_id', Number(req.params.movieId))
  if (error) return res.status(502).json({ error: error.message })
  res.status(204).end()
})

export default router
