import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase.from('ratings').select('movie_id, value')
  if (error) return res.status(502).json({ error: error.message })
  res.json(Object.fromEntries(data.map((r) => [r.movie_id, r.value])))
})

router.put('/:movieId', async (req, res) => {
  const value = Number(req.body?.value)
  if (!Number.isFinite(value) || value < 0 || value > 5) {
    return res.status(400).json({ error: 'value must be a number between 0 and 5' })
  }
  const movieId = Number(req.params.movieId)

  const { error } =
    value === 0
      ? await req.supabase.from('ratings').delete().eq('movie_id', movieId)
      : await req.supabase
          .from('ratings')
          .upsert({ user_id: req.user.id, movie_id: movieId, value }, { onConflict: 'user_id,movie_id' })

  if (error) return res.status(502).json({ error: error.message })
  res.status(204).end()
})

export default router
