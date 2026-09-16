import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getTasteProfile } from '../services/taste.js'
import { runChatTurn } from '../services/gemini.js'

const router = Router()
router.use(requireAuth)

const HISTORY_LIMIT = 10
const MAX_MESSAGE_LENGTH = 2000
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

// Per-instance, in-memory: resets on cold start and isn't shared across
// concurrent Vercel function instances, so it's a speed bump against a script
// hammering one warm instance, not a hard global cap. Good enough to keep an
// open endpoint from turning into an unbounded Gemini bill; a real limit
// belongs in Supabase/Redis if abuse becomes a real problem.
const requestLog = new Map()

function isRateLimited(userId) {
  const now = Date.now()
  const recent = (requestLog.get(userId) || []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  requestLog.set(userId, recent)
  return recent.length > RATE_LIMIT
}

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
  if (userText.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `message must be under ${MAX_MESSAGE_LENGTH} characters` })
  }
  if (isRateLimited(req.user.id)) {
    return res.status(429).json({ error: 'Too many messages, slow down a moment.' })
  }

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
