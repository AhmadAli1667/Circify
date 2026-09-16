import { Router } from 'express'
import { supabaseAdmin } from '../services/supabase.js'

const router = Router()

// Vercel Cron hits this daily so the Supabase project always has recent API
// activity (see backend/vercel.json). Guards against anyone else triggering it
// using the CRON_SECRET Vercel automatically sends as a bearer token on its
// own invocations.
router.get('/keepalive', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { error } = await supabaseAdmin.from('keepalive').upsert({ id: 1, pinged_at: new Date().toISOString() })
  if (error) return res.status(502).json({ error: error.message })

  res.status(204).end()
})

export default router
