import { getMovieKeywords } from './keywords.js'

const RECENCY_BONUS_COUNT = 5
const TOP_KEYWORD_COUNT = 15

/**
 * A user's taste profile: their watchlist/ratings' TMDb keywords, weighted so
 * recently-saved and highly-rated movies count for more, then reduced to the
 * strongest signals. Computed on read, no separate aggregate table to keep in
 * sync, the app has nowhere near the scale where that would matter.
 *
 * `supabase` is the request-scoped client (see middleware/auth.js), RLS
 * already limits these reads to the calling user's own rows.
 */
export async function getTasteProfile(supabase) {
  const [{ data: watchlist, error: watchlistError }, { data: ratings, error: ratingsError }] = await Promise.all([
    supabase.from('watchlist').select('movie_id').order('added_at', { ascending: false }),
    supabase.from('ratings').select('movie_id, value')
  ])
  if (watchlistError) throw new Error(watchlistError.message)
  if (ratingsError) throw new Error(ratingsError.message)

  const weighted = [
    ...watchlist.map((w, i) => ({
      movieId: w.movie_id,
      weight: 2 + (i < RECENCY_BONUS_COUNT ? 1 : 0)
    })),
    ...ratings.map((r) => ({ movieId: r.movie_id, weight: r.value - 3 }))
  ]

  const scores = new Map() // keyword id -> { name, score }
  await Promise.all(
    weighted.map(async ({ movieId, weight }) => {
      if (!weight) return
      const keywords = await getMovieKeywords(movieId).catch(() => [])
      for (const kw of keywords) {
        const entry = scores.get(kw.id) || { name: kw.name, score: 0 }
        entry.score += weight
        scores.set(kw.id, entry)
      }
    })
  )

  const topKeywords = [...scores.entries()]
    .map(([id, { name, score }]) => ({ id, name, score }))
    .filter((k) => k.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_KEYWORD_COUNT)

  return { topKeywords, watchlistCount: watchlist.length, ratingsCount: ratings.length }
}
