import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTheme } from './theme'
import { adaptMovie, SERIES_AVAILABLE } from './catalog'
import { hueFor } from './art'
import * as api from './tmdbApi'
import * as authApi from './authApi'
import { supabase } from './supabaseClient'
import { StoreContext } from './storeContext'

const STORAGE_KEY = 'flixmate'

/** Fields mirrored into localStorage: cosmetic/local-only prefs plus the movie
 *  cache, so browsing still resolves to real titles after a reload. Watchlist,
 *  ratings, and chat history are account data now, they live in the backend. */
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeSaved(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        preset: state.preset,
        mode: state.mode,
        avatar: state.avatar,
        movieCache: state.movieCache
      })
    )
  } catch {
    /* private mode / quota: persistence is best-effort */
  }
}

const saved = readSaved()

const INITIAL = {
  screen: 'home',
  preset: saved.preset || 'midnight',
  mode: saved.mode || 'dark',

  // discovery filters
  query: '',
  searching: false,
  sortBy: 'rating',
  genre: 'all',
  minRating: 0,
  decade: 'all',
  type: 'all',
  mood: null,

  // TMDb-backed catalogue
  movies: [],
  moviesLoading: true,
  moviesError: null,
  genreMap: {},
  liveSearchResults: [],
  movieCache: saved.movieCache || {},

  // account, hydrated from the backend session on mount
  user: null,
  authChecked: false,
  authBusy: false,
  authError: null,
  authEmail: '',
  authDisplayName: '',
  watchlist: [],
  ratings: {},
  avatar: saved.avatar || null,

  // navigation / transient
  modalId: null,
  modalTab: 'overview',
  actorId: null,
  castCrewId: null,
  heroIndex: 0,
  profileTab: 'watchlist',
  hoverStar: 0,
  authMode: 'login',
  pw: '',
  menuOpen: false,
  filterOpen: false,
  wizardHover: false,
  wizardPin: false,
  feedbackText: '',
  feedbackSent: false,

  // assistant
  chat: 'closed',
  chatInput: '',
  chatMsgs: [
    {
      role: 'bot',
      text: "Hi, I'm Flixmate, your film matchmaker. Tell me the mood you're in and I'll pull picks tuned to your taste."
    }
  ],
  chatTyping: false,

  // overlays
  shareOpen: false,
  castExpanded: false,
  synExpanded: false,
  trailerId: null,

  // interaction maps
  feedLiked: {},
  actLiked: {},
  feedMode: 'trailer',
  toggles: { notif: true, newRel: true, privacy: false, friends: true, google: true },
  following: {},

  // "coming soon" notice
  toast: null
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(INITIAL)
  const toastTimer = useRef(null)

  /**
   * Latest state for callbacks that outlive a render: the hero interval and
   * the document-level outside-click listener. Written in an effect rather
   * than during render so React never sees a mutated ref mid-render.
   */
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  /** Shallow merge, mirroring the mockup's this.setState(partial). */
  const patch = useCallback((next) => {
    setState((s) => {
      const delta = typeof next === 'function' ? next(s) : next
      return { ...s, ...delta }
    })
  }, [])

  /** Merges adapted movies into the accumulating id → movie registry. */
  const cacheMovies = useCallback(
    (list) =>
      patch((s) => ({
        movieCache: { ...s.movieCache, ...Object.fromEntries((list || []).filter(Boolean).map((m) => [m.id, m])) }
      })),
    [patch]
  )

  // Persist the durable slice whenever it changes.
  useEffect(() => {
    writeSaved(state)
  }, [state.preset, state.mode, state.avatar, state.movieCache]) // eslint-disable-line react-hooks/exhaustive-deps

  // Paint the theme onto <html>.
  useEffect(() => {
    applyTheme(state.preset, state.mode)
  }, [state.preset, state.mode])

  // --- catalogue bootstrap -------------------------------------------------

  /**
   * Builds the browsing pool once on mount: trending + a few pages each of
   * popular/top-rated/now-playing, deduped by id. TMDb has no single "every
   * movie" endpoint on the free tier, so this is the real catalogue's depth
   * for Home rows and filter/sort. The search box additionally reaches live
   * TMDb search below, so typing isn't limited to this pool.
   */
  useEffect(() => {
    let alive = true

    async function bootstrap() {
      try {
        const [genresRes, trending, pop1, pop2, pop3, top1, top2, now1, now2] = await Promise.all([
          api.getGenres(),
          api.getTrending(),
          api.getPopular(1),
          api.getPopular(2),
          api.getPopular(3),
          api.getTopRated(1),
          api.getTopRated(2),
          api.getNowPlaying(1),
          api.getNowPlaying(2)
        ])
        const genreMap = Object.fromEntries((genresRes.genres || []).map((g) => [g.id, g.name]))

        const seen = new Map()
        for (const list of [trending, pop1, pop2, pop3, top1, top2, now1, now2]) {
          for (const raw of list.results || []) {
            if (seen.has(raw.id)) continue
            const adapted = adaptMovie(raw, genreMap)
            if (adapted) seen.set(raw.id, adapted)
          }
        }
        const pool = [...seen.values()]
        if (!alive) return

        patch((s) => ({
          movies: pool,
          moviesLoading: false,
          genreMap,
          movieCache: { ...s.movieCache, ...Object.fromEntries(pool.map((m) => [m.id, m])) }
        }))
      } catch (e) {
        if (alive) patch({ moviesLoading: false, moviesError: e.message })
      }
    }

    bootstrap()
    return () => {
      alive = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- account -------------------------------------------------------------

  /** Pulls the signed-in user's watchlist/ratings/chat thread from the backend. */
  const hydrateAccount = useCallback(
    async (user) => {
      const [watchlist, ratings, history] = await Promise.all([
        api.getWatchlist().catch(() => []),
        api.getRatings().catch(() => ({})),
        api.getChatHistory().catch(() => ({ messages: [] }))
      ])
      const chatMsgs = history.messages.length
        ? history.messages.map((m) => ({
            role: m.role,
            text: m.text,
            ...(m.picks?.length ? { movies: m.picks.map((p) => ({ ...p, hue: hueFor(p.title) })) } : {})
          }))
        : INITIAL.chatMsgs
      patch({ user, watchlist, ratings, chatMsgs, authChecked: true, authBusy: false, authError: null })
    },
    [patch]
  )

  // Resolve any existing Supabase session once on load. `INITIAL_SESSION` fires
  // once immediately with whatever's already there (or null); `SIGNED_OUT`
  // covers explicit logout plus e.g. a session going invalid elsewhere. Sign-in
  // itself is handled by the `signup`/`login` actions below, not here, so a
  // fresh signup/login doesn't hydrate twice.
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) hydrateAccount(authApi.normalizeUser(session.user))
        else patch({ authChecked: true })
      } else if (event === 'SIGNED_OUT') {
        patch({ user: null, watchlist: [], ratings: {}, chatMsgs: INITIAL.chatMsgs, authChecked: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [hydrateAccount, patch])

  // Debounced live search, merged into the local pool in `results` below.
  // `pool` ignores `liveSearchResults` whenever the query is empty (see below),
  // so there's nothing to reset here for that case. Also tries a studio/
  // franchise match (searching "marvel" pulls in Marvel Studios' catalogue,
  // not just titles with the word in them).
  useEffect(() => {
    const q = state.query.trim()
    if (!q) return
    let alive = true
    const t = setTimeout(async () => {
      patch({ searching: true })
      try {
        const [multi, companies] = await Promise.all([
          api.searchMulti(q),
          api.searchCompany(q).catch(() => null)
        ])
        const fromMulti = (multi.results || [])
          .filter((r) => r.media_type === 'movie')
          .map((m) => adaptMovie(m, state.genreMap))
          .filter(Boolean)

        const topCompany = companies?.results?.[0]
        let fromCompany = []
        if (topCompany && topCompany.name.toLowerCase().includes(q.toLowerCase())) {
          const discover = await api
            .discoverMovies({ with_companies: topCompany.id, sort_by: 'popularity.desc' })
            .catch(() => null)
          fromCompany = (discover?.results || []).map((m) => adaptMovie(m, state.genreMap)).filter(Boolean)
        }

        const seen = new Set(fromMulti.map((m) => m.id))
        const merged = [...fromMulti, ...fromCompany.filter((m) => !seen.has(m.id)).slice(0, 20)]
        if (!alive) return
        patch({ liveSearchResults: merged, searching: false })
        cacheMovies(merged)
      } catch {
        /* live search is best-effort; the loaded pool still filters locally */
        if (alive) patch({ searching: false })
      }
    }, 350)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [state.query, state.genreMap, patch, cacheMovies])

  // Hero carousel. Pauses while a modal or the trailer player is open.
  useEffect(() => {
    const t = setInterval(() => {
      const s = stateRef.current
      if (s.screen === 'home' && !s.modalId && !s.trailerId) {
        patch((cur) => ({ heroIndex: (cur.heroIndex + 1) % 5 }))
      }
    }, 6500)
    return () => clearInterval(t)
  }, [patch])

  // Dismiss the avatar menu / filter popover on an outside click.
  useEffect(() => {
    const onDown = (e) => {
      if (e.target?.closest?.('[data-fm-pop]')) return
      const s = stateRef.current
      if (s.menuOpen || s.filterOpen) patch({ menuOpen: false, filterOpen: false })
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [patch])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // --- actions -----------------------------------------------------------

  /** Announce a feature the prototype can't back with real data yet. */
  const showSoon = useCallback(
    (label) => {
      clearTimeout(toastTimer.current)
      patch({ toast: `${label}: coming soon` })
      toastTimer.current = setTimeout(() => patch({ toast: null }), 2600)
    },
    [patch]
  )

  const nav = useCallback(
    (screen, extra) => {
      patch({ screen, modalId: null, menuOpen: false, filterOpen: false, ...(extra || {}) })
      window.scrollTo(0, 0)
    },
    [patch]
  )

  const openMovie = useCallback(
    (id) =>
      patch({
        modalId: id,
        modalTab: 'overview',
        hoverStar: 0,
        castExpanded: false,
        synExpanded: false,
        menuOpen: false,
        filterOpen: false
      }),
    [patch]
  )

  const openActor = useCallback((id) => nav('actor', { actorId: id }), [nav])
  const openCastCrew = useCallback((id) => nav('castcrew', { castCrewId: id }), [nav])

  const toggleWatch = useCallback(
    (id) => {
      if (!stateRef.current.user) {
        showSoon('Sign in to save your watchlist')
        nav('auth')
        return
      }
      const has = stateRef.current.watchlist.includes(id)
      patch((s) => ({ watchlist: has ? s.watchlist.filter((x) => x !== id) : [id, ...s.watchlist] }))
      ;(has ? api.removeFromWatchlist(id) : api.addToWatchlist(id)).catch(() => {})
    },
    [patch, showSoon, nav]
  )

  const setRating = useCallback(
    (id, v) => {
      if (!stateRef.current.user) {
        showSoon('Sign in to rate movies')
        nav('auth')
        return
      }
      patch((s) => ({ ratings: { ...s.ratings, [id]: v } }))
      api.setRatingRemote(id, v).catch(() => {})
    },
    [patch, showSoon, nav]
  )

  const signup = useCallback(
    async (email, password, displayName) => {
      patch({ authBusy: true, authError: null })
      try {
        const { user, session } = await authApi.signup(email, password, displayName)
        if (!session) {
          // Supabase project has "confirm email" on: the account exists but isn't signed in yet.
          patch({ authBusy: false, authError: 'Check your email to confirm your account, then sign in.' })
          return
        }
        await hydrateAccount(user)
        nav('home')
      } catch (e) {
        patch({ authBusy: false, authError: e.message })
      }
    },
    [patch, hydrateAccount, nav]
  )

  const login = useCallback(
    async (email, password) => {
      patch({ authBusy: true, authError: null })
      try {
        const { user } = await authApi.login(email, password)
        await hydrateAccount(user)
        nav('home')
      } catch (e) {
        patch({ authBusy: false, authError: e.message })
      }
    },
    [patch, hydrateAccount, nav]
  )

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    patch({ user: null, watchlist: [], ratings: {}, chatMsgs: INITIAL.chatMsgs })
    nav('home')
  }, [patch, nav])

  const playTrailer = useCallback(
    (id) => patch({ trailerId: id, menuOpen: false, filterOpen: false }),
    [patch]
  )

  const resetFilters = useCallback(
    () => patch({ genre: 'all', minRating: 0, decade: 'all', type: 'all', mood: null, query: '' }),
    [patch]
  )

  /**
   * Series selection can't be honoured (the catalogue is films only), so the
   * control reports itself as unavailable rather than returning nothing.
   */
  const setType = useCallback(
    (k) => {
      if (k === 'series' && !SERIES_AVAILABLE) {
        showSoon('TV series')
        return
      }
      patch({ type: k })
    },
    [patch, showSoon]
  )

  const getMovie = useCallback((id) => state.movieCache[id], [state.movieCache])

  // --- derived -----------------------------------------------------------

  const filtersActive = Boolean(
    state.genre !== 'all' ||
      state.minRating > 0 ||
      state.decade !== 'all' ||
      state.type !== 'all' ||
      state.mood ||
      state.query
  )

  /** The loaded pool, plus any live-search hits not already in it. */
  const pool = useMemo(() => {
    if (!state.query.trim()) return state.movies
    const seen = new Set(state.movies.map((m) => m.id))
    const extra = state.liveSearchResults.filter((m) => !seen.has(m.id))
    return [...state.movies, ...extra]
  }, [state.movies, state.liveSearchResults, state.query])

  const results = useMemo(() => {
    const { genre, minRating, decade, type, query, sortBy } = state
    const q = query.trim().toLowerCase()
    // Live-search hits (title/multi match, or a franchise/studio match like
    // "marvel" -> Marvel Studios' catalogue) were already matched against
    // the query server-side. Re-running a local title/cast text check on
    // them would wrongly drop e.g. "Spider-Man" from a "marvel" search, its
    // title doesn't contain the word, the studio credit does.
    const preMatched = new Set(state.liveSearchResults.map((m) => m.id))

    const list = pool.filter((m) => {
      if (type !== 'all' && m.kind !== type) return false
      if (genre !== 'all' && !m.genres.includes(genre)) return false
      if (m.rating < minRating) return false
      if (decade !== 'all') {
        const y = m.year
        if (decade === '2020' && y < 2020) return false
        if (decade === '2010' && (y < 2010 || y > 2019)) return false
        if (decade === '2000' && (y < 2000 || y > 2009)) return false
        if (decade === 'class' && y >= 2000) return false
      }
      if (q && !preMatched.has(m.id)) {
        const cast = m.leadCast.join(' ').toLowerCase()
        const hit =
          m.title.toLowerCase().includes(q) ||
          m.genres.join(' ').toLowerCase().includes(q) ||
          (m.director || '').toLowerCase().includes(q) ||
          cast.includes(q)
        if (!hit) return false
      }
      return true
    })

    return list.sort((a, b) => {
      if (sortBy === 'year') return b.year - a.year
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return b.rating - a.rating
    })
  }, [pool, state.liveSearchResults, state.genre, state.minRating, state.decade, state.type, state.query, state.sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Genre chips, derived from what the loaded pool actually contains. */
  const genres = useMemo(() => {
    const counts = new Map()
    state.movies.forEach((m) => m.genres.forEach((g) => counts.set(g, (counts.get(g) || 0) + 1)))
    return [...counts.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
  }, [state.movies])

  // --- assistant ---------------------------------------------------------

  /** Sends a message to the real backend-hosted assistant and appends its reply. */
  const doChat = useCallback(
    (text) => {
      if (!stateRef.current.user) {
        showSoon('Sign in to chat with Flixmate')
        nav('auth')
        return
      }
      patch((s) => ({
        chatMsgs: [...s.chatMsgs, { role: 'user', text }],
        chatInput: '',
        chatTyping: true,
        chat: s.screen === 'chat' ? s.chat : 'open'
      }))
      api.sendChatMessage(text).then(
        ({ reply, picks }) => {
          patch((s) => ({
            chatTyping: false,
            chatMsgs: [
              ...s.chatMsgs,
              { role: 'bot', text: reply, movies: (picks || []).map((p) => ({ ...p, hue: hueFor(p.title) })) }
            ]
          }))
        },
        () => {
          patch((s) => ({
            chatTyping: false,
            chatMsgs: [
              ...s.chatMsgs,
              { role: 'bot', text: "I'm having trouble reaching my brain right now, try again in a bit." }
            ]
          }))
        }
      )
    },
    [patch, showSoon, nav]
  )

  const value = useMemo(
    () => ({
      state,
      patch,
      nav,
      openMovie,
      openActor,
      openCastCrew,
      toggleWatch,
      setRating,
      playTrailer,
      resetFilters,
      setType,
      showSoon,
      doChat,
      cacheMovies,
      filtersActive,
      results,
      genres,
      getMovie,
      signup,
      login,
      logout
    }),
    [
      state,
      patch,
      nav,
      openMovie,
      openActor,
      openCastCrew,
      toggleWatch,
      setRating,
      playTrailer,
      resetFilters,
      setType,
      showSoon,
      doChat,
      cacheMovies,
      filtersActive,
      results,
      genres,
      getMovie,
      signup,
      login,
      logout
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
