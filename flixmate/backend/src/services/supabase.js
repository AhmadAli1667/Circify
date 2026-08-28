import { createClient } from '@supabase/supabase-js'

const URL = process.env.SUPABASE_URL
const ANON_KEY = process.env.SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Service-role client, bypasses RLS. Only for the shared movie_keywords cache, never user data. */
export const supabaseAdmin = createClient(URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

/** Anon client reused across requests for `getClaims`, verifies a JWT's signature against the project's JWKS. */
export const supabaseAnon = createClient(URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

/** Anon client carrying one request's JWT, so RLS policies (`auth.uid() = user_id`) apply to its queries. */
export function supabaseAsUser(token) {
  return createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}
