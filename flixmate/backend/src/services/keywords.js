import { supabaseAdmin } from './supabase.js'
import tmdbFetch from './tmdb.js'

/** TMDb's real keyword tags for a movie, e.g. [{id, name}]. Cached in Supabase. */
export async function getMovieKeywords(movieId) {
  const { data: cached } = await supabaseAdmin
    .from('movie_keywords')
    .select('keywords')
    .eq('movie_id', movieId)
    .maybeSingle()
  if (cached) return cached.keywords

  const data = await tmdbFetch(`/movie/${movieId}/keywords`)
  const keywords = data.keywords || []
  await supabaseAdmin.from('movie_keywords').upsert({ movie_id: movieId, keywords })
  return keywords
}
