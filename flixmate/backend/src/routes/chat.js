import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getTasteProfile } from '../services/taste.js'
import { runChatTurn } from '../services/gemini.js'

const router = Router()
router.use(requireAuth)

const HISTORY_LIMIT = 10

router.get('/history', async (req, res) => {
  const { data, error } = await req.supabase
    .from('chat_messages')
    .select('role, text, picks')
    .order('id', { ascending: true })
  if (error) return res.status(502).json({ error: error.message })
  res.json({ messages: data.map((r) => ({ role: r.role, text: r.text, picks: r.picks || [] })) })
})

router.post('/', async (req, res) => {
  const userText = (req.body?.message || '').trim()
  if (!userText) return res.status(400).json({ error: 'message is required' })

  try {
    const { data: historyRows, error: historyError } = await req.supabase
      .from('chat_messages')
      .select('role, text')
      .order('id', { ascending: false })
      .limit(HISTORY_LIMIT)
    if (historyError) throw new Error(historyError.message)

    const taste = await getTasteProfile(req.supabase)
    const { reply, picks } = await runChatTurn({ historyRows: historyRows.reverse(), taste, userText })

    const { error: insertError } = await req.supabase.from('chat_messages').insert([
      { user_id: req.user.id, role: 'user', text: userText },
      { user_id: req.user.id, role: 'bot', text: reply, picks: picks.length ? picks : null }
    ])
    if (insertError) throw new Error(insertError.message)

    res.json({ reply, picks })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

export default router
