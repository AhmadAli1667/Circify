import { supabase } from './supabaseClient'

/** Supabase's user object, reduced to the shape the rest of the app uses. */
export function normalizeUser(user) {
  if (!user) return null
  return { id: user.id, email: user.email, displayName: user.user_metadata?.display_name || user.email }
}

export async function signup(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  })
  if (error) throw new Error(error.message)
  return { user: normalizeUser(data.user), session: data.session }
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return { user: normalizeUser(data.user), session: data.session }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
