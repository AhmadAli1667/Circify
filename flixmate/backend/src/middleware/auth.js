import { supabaseAnon, supabaseAsUser } from '../services/supabase.js'

/** Verifies the `Authorization: Bearer <token>` Supabase access token and attaches `req.user` / `req.supabase`. */
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Not signed in' })

  const { data, error } = await supabaseAnon.auth.getClaims(token)
  if (error || !data) return res.status(401).json({ error: 'Not signed in' })

  const { claims } = data
  req.user = { id: claims.sub, email: claims.email, displayName: claims.user_metadata?.display_name }
  req.supabase = supabaseAsUser(token)
  next()
}
