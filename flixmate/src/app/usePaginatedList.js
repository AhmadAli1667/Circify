import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Generic "keep loading more" pagination over a TMDb-shaped
 * `{results, page, total_pages}` fetcher. Loads page 1 on mount, dedupes by
 * id across pages (TMDb list endpoints can repeat entries page to page).
 *
 * To reset with a different query (a different genre, a different taste
 * profile), remount with a fresh `key` rather than passing a reset flag in,
 * that's the idiomatic way to get fresh hook state and avoids a resettable
 * effect that fights React's "don't setState synchronously in an effect"
 * guidance.
 */
export function usePaginatedList(fetchPage, adapt) {
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const pageRef = useRef(0)
  const seenRef = useRef(new Set())
  const busyRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return
    busyRef.current = true
    setLoading(true)
    try {
      const nextPage = pageRef.current + 1
      const data = await fetchPage(nextPage)
      const adapted = (data.results || [])
        .map(adapt)
        .filter(Boolean)
        .filter((m) => !seenRef.current.has(m.id))
      adapted.forEach((m) => seenRef.current.add(m.id))
      pageRef.current = nextPage
      setItems((prev) => [...prev, ...adapted])
      setHasMore(nextPage < (data.total_pages || 1))
    } catch {
      setHasMore(false)
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }, [fetchPage, adapt, hasMore])

  useEffect(() => {
    loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { items, loadMore, hasMore, loading }
}
