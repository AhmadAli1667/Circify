import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTheme } from './theme'
import { movies as MOVIES, getMovie, GENRES, SERIES_AVAILABLE } from './catalog'
import { StoreContext } from './storeContext'

const STORAGE_KEY = 'flixmate'

/** Fields mirrored into localStorage — same set the mockup persisted. */
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
        watchlist: state.watchlist,
        ratings: state.ratings,
        avatar: state.avatar
      })
    )
  } catch {
    /* private mode / quota — persistence is best-effort */
  }
}

const saved = readSaved()

const INITIAL = {
  screen: 'home',
  preset: saved.preset || 'midnight',
  mode: saved.mode || 'dark',

  // discovery filters
  query: '',
  sortBy: 'rating',
  genre: 'all',
  minRating: 0,
  decade: 'all',
  type: 'all',
  mood: null,

  // user data
  watchlist: saved.watchlist || [1, 7, 12],
  ratings: saved.ratings || { 2: 4, 5: 5, 9: 3 },
  avatar: saved.avatar || null,

  // navigation / transient
  modalId: null,
  actorSlug: null,
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
      text: "Hi, I'm Flixmate — your film matchmaker. Tell me the mood you're in and I'll pull picks tuned to your taste."
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
  feedTab: {},
  rowExpanded: {},
  toggles: { notif: true, newRel: true, privacy: false, friends: true, google: true },
  following: {},

  // "coming soon" notice
  toast: null
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(INITIAL)
  const toastTimer = useRef(null)

  /**
   * Latest state for callbacks that outlive a render — the hero interval and
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

  // Persist the durable slice whenever it changes.
  useEffect(() => {
    writeSaved(state)
  }, [state.preset, state.mode, state.watchlist, state.ratings, state.avatar]) // eslint-disable-line react-hooks/exhaustive-deps

  // Paint the theme onto <html>.
  useEffect(() => {
    applyTheme(state.preset, state.mode)
  }, [state.preset, state.mode])

  // Hero carousel — pauses while a modal or the trailer player is open.
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
      patch({ toast: `${label} — coming soon` })
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
        hoverStar: 0,
        castExpanded: false,
        synExpanded: false,
        menuOpen: false,
        filterOpen: false
      }),
    [patch]
  )

  const openActor = useCallback((slug) => nav('actor', { actorSlug: slug }), [nav])

  const toggleWatch = useCallback(
    (id) =>
      patch((s) => ({
        watchlist: s.watchlist.includes(id)
          ? s.watchlist.filter((x) => x !== id)
          : [id, ...s.watchlist]
      })),
    [patch]
  )

  const setRating = useCallback(
    (id, v) => patch((s) => ({ ratings: { ...s.ratings, [id]: v } })),
    [patch]
  )

  const playTrailer = useCallback(
    (id) => patch({ trailerId: id, menuOpen: false, filterOpen: false }),
    [patch]
  )

  const resetFilters = useCallback(
    () => patch({ genre: 'all', minRating: 0, decade: 'all', type: 'all', mood: null, query: '' }),
    [patch]
  )

  /**
   * Series selection can't be honoured — the catalogue is films only — so the
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

  // --- derived -----------------------------------------------------------

  const filtersActive = Boolean(
    state.genre !== 'all' ||
      state.minRating > 0 ||
      state.decade !== 'all' ||
      state.type !== 'all' ||
      state.mood ||
      state.query
  )

  const results = useMemo(() => {
    const { genre, minRating, decade, type, query, sortBy } = state
    const q = query.trim().toLowerCase()

    const list = MOVIES.filter((m) => {
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
      if (q) {
        const cast = m.leadCast.join(' ').toLowerCase()
        const hit =
          m.title.toLowerCase().includes(q) ||
          m.genres.join(' ').toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
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
  }, [state.genre, state.minRating, state.decade, state.type, state.query, state.sortBy]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- assistant ---------------------------------------------------------

  /**
   * Keyword → genre matcher standing in for a real recommendation model.
   * Deterministic and offline, exactly as the mockup demonstrated it.
   */
  const vibePick = useCallback((text) => {
    const kws = (text || '').toLowerCase()
    let pool = MOVIES
    if (/sci|space|mind|future|alien|robot/.test(kws)) {
      pool = MOVIES.filter((m) => m.genres.includes('Sci-Fi'))
    } else if (/slow|burn|tense|thril|rain|night|dark|crime/.test(kws)) {
      pool = MOVIES.filter((m) => m.genres.some((g) => ['Thriller', 'Drama', 'Crime'].includes(g)))
    } else if (/feel|good|cozy|comfort|comedy|road|happy|light|funny/.test(kws)) {
      pool = MOVIES.filter((m) => m.genres.some((g) => ['Comedy', 'Romance'].includes(g)))
    } else if (/scar|horror|creep|eerie|fright/.test(kws)) {
      pool = MOVIES.filter((m) => m.genres.includes('Horror'))
    }
    if (!pool.length) pool = MOVIES

    const whys = [
      'Atmospheric and character-first — exactly the texture you described.',
      'Slow-building with a payoff that rewards patience.',
      'Hits the tone without ever tipping into cliché.'
    ]
    return [...pool]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2)
      .map((m, i) => ({ id: m.id, title: m.title, year: m.year, hue: m.hue, why: whys[i % 3] }))
  }, [])

  const doChat = useCallback(
    (text) => {
      patch((s) => ({
        chatMsgs: [...s.chatMsgs, { role: 'user', text }],
        chatInput: '',
        chatTyping: true,
        chat: s.screen === 'chat' ? s.chat : 'open'
      }))
      setTimeout(() => {
        const picks = vibePick(text)
        patch((s) => ({
          chatTyping: false,
          chatMsgs: [
            ...s.chatMsgs,
            { role: 'bot', text: 'Based on your taste, here are two I think you’ll love:', movies: picks }
          ]
        }))
      }, 1000)
    },
    [patch, vibePick]
  )

  const value = useMemo(
    () => ({
      state,
      patch,
      nav,
      openMovie,
      openActor,
      toggleWatch,
      setRating,
      playTrailer,
      resetFilters,
      setType,
      showSoon,
      doChat,
      filtersActive,
      results,
      genres: GENRES,
      getMovie
    }),
    [
      state,
      patch,
      nav,
      openMovie,
      openActor,
      toggleWatch,
      setRating,
      playTrailer,
      resetFilters,
      setType,
      showSoon,
      doChat,
      filtersActive,
      results
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
