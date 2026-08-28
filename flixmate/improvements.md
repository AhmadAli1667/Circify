# Improvements

A ranked backlog for Flixmate as it stands on 2026-08-21, drawn from reading the current
working tree (not a wish list: every item names the file it lands in). Effort is rough:
**S** under an hour, **M** half a day, **L** multi-day.

Ordering inside each group is by value for the effort, highest first.

---

## 1. Bugs and gaps that are wrong today

**A failed catalogue fetch shows an empty app with no message.** `M` is generous, this is
`S`. `store.jsx:206` sets `moviesError`, and nothing anywhere reads it. If TMDb or the
backend is down, `BootScreen` disappears, every row renders empty, and the user is told
nothing. Render an error state in `App.jsx` next to the `moviesLoading` branch, with a
retry that re-runs the bootstrap. **Effort: S.**

**Watchlist and rating writes fail silently.** `store.jsx`'s `toggleWatch` and `setRating`
update local state optimistically then call the API with `.catch(() => {})`. A dropped
request leaves the UI claiming something is saved when the database never got it, and it
reverts on the next reload with no explanation. Roll the optimistic patch back in the
catch and surface it through the existing `showSoon`/toast channel. **Effort: S.**

**Nothing closes on Escape.** There is no `keydown` handler anywhere in `src/`. The movie
modal, trailer modal, share modal, avatar menu, filter popover, and For You's reviews
sheet are all mouse-only to dismiss. One shared `useEscape(onClose)` hook covers all of
them. **Effort: S.**

**No error boundary.** One thrown error in any screen's render blanks the entire app to a
white page. A single boundary around `<Screen />` in `App.jsx` that offers "go home"
contains it. **Effort: S.**

**`movieCache` grows without a ceiling.** `writeSaved` in `store.jsx` persists the whole
accumulating `{id: movie}` registry to localStorage on every change. Browse long enough
and this crosses the ~5MB quota, at which point the try/catch swallows the failure and
persistence silently stops working for everything, including theme and avatar. Cap it
(LRU, a few hundred entries) before writing. **Effort: S.**

**Watch providers are hardcoded to the US.** `catalog.js` reads `providers?.results?.US`,
so anyone outside the US sees "no providers" for titles that are streaming where they
live. Take the region from `navigator.language` (or a Settings preference) and fall back
to US. **Effort: S.**

**The chat endpoint has no rate limit and no input cap.** `backend/src/routes/chat.js`
forwards whatever arrives straight into a paid-shaped model call. Public on Vercel, one
script turns into a bill. Add a per-user limit and a max message length before the Gemini
call. **Effort: S.**

**`tmdbFetch` has no retry and no cache.** `backend/src/services/tmdb.js` does a bare
`fetch` and throws on any non-OK. TMDb 429s under normal use once a few people are
browsing, and the catalogue bootstrap alone is 9 calls per page load per visitor. Add a
short in-memory TTL cache keyed by path+params plus one backoff retry on 429/5xx.
**Effort: M**, and it is the single biggest latency win available.

---

## 2. Performance

**Split the bundle.** The build ships one 551KB JS chunk (152KB gzipped) and warns about
it. Every screen, both modals, and the chat widget load before the first paint.
`React.lazy` per screen in `App.jsx`'s `SCREENS` map, with the existing `BootScreen` as
the fallback. **Effort: S.**

**One state object means the whole app re-renders on every keystroke.** `store.jsx` keeps
`query`, `chatInput`, `hoverStar`, `heroIndex` and similar transient values in the same
`useState` object as the catalogue, and hands the whole thing through one context. Typing
in the search box re-renders every mounted screen and card. Move transient input state
into the components that own it, and split the context into a stable actions value and a
changing state value. **Effort: M**, high payoff on lower-end phones.

**The For You feed never trims.** `usePaginatedList` appends forever and `ForYou` renders
every loaded card, each with a live `IntersectionObserver` entry, a mounted YouTube iframe
for whichever have been visited, and a poster image. Twenty minutes of scrolling is
hundreds of live nodes. Windowing to a few cards either side of the active one is the fix.
**Effort: M.**

**Serve smaller images.** `catalog.js` requests `w500` posters for every grid card and
`w1280` backdrops, at display sizes closer to 170px wide. Add a size argument to the image
URL builders and use `w342`/`w185` for grids and rails. **Effort: S.**

**Trailers keep playing when the tab is hidden.** The For You iframes and `TrailerModal`
ignore `visibilitychange`. Pause on hide via the YouTube iframe API, or drop the `src`.
**Effort: S.**

---

## 3. Architecture

**Add a router.** `state.screen` is a string in one global object, which means no URLs: no
deep links, no browser back button, no shareable movie links (which makes `ShareModal`
mostly decorative), no bookmarks, nothing for search engines. React Router with routes for
`/`, `/search`, `/movie/:id`, `/actor/:id`, `/for-you` would let `openMovie` become a link
and would delete a chunk of navigation state from the store. This is the single largest
structural upgrade available, and everything in the product group below gets easier after
it. **Effort: L.**

**Validate environment at boot.** Both the backend and `supabaseClient.js` fail late and
cryptically when a key is missing or wrong. A small startup check that lists exactly which
variables are absent, on both sides, saves the next setup session. **Effort: S.**

**Fold the movie modal's reviews onto the real feed.** `MovieModal.jsx` still renders the
four hardcoded `REVIEW_POOL` entries while For You now shows real TMDb reviews through
`useMovieReviews`. Same hook, same rows, one less piece of sample data in the app.
**Effort: S.**

---

## 4. Product and honesty

**Derive For You's reason chip from the real reason.** The feed genuinely re-sorts by the
genres behind your 4-and-5-star ratings, but the chip above the card picks a string at
random from `REASONS`, so it can say "Because you rated it five stars" for a title matched
on nothing of the sort. The sort already knows which genre matched: pass it through and
say the true thing. **Effort: S.**

**Friends and Theatres are still sample data.** `Friends.jsx` invents people and activity;
`Theatres.jsx` invents showtimes. Theatres could become real with TMDb's `now_playing`
plus a location prompt (showtimes themselves need a paid source, so state that). Friends
needs a social graph, which is a real feature, not a data swap: either build it on
Supabase (a `follows` table, RLS-scoped) or label the screen as a preview. **Effort: L.**

**Written reviews.** For You's composer saves stars for real and says outright that written
reviews are not wired up. A `reviews` table alongside `ratings`, RLS-scoped the same way,
would close the loop, with the user's own reviews shown above TMDb's. **Effort: M.**

**Chat latency is the worst thing about the assistant.** Already logged as a known issue
(8 to 65 seconds). Two concrete angles: stream the reply so text appears as it is
generated instead of after the final tool round, and prefetch a first `search_movies`
candidate set from the taste profile before the first model call, which removes a whole
round trip. **Effort: M.**

**Keyboard support for the feed.** Up/down arrows to page, `m` to mute, `c` to toggle
reviews. The pager buttons exist, they just have no keyboard equivalent. **Effort: S.**

---

## 5. Quality and ops

**There are no tests at all.** No test runner, no test script. The highest-value place to
start is the pure adapter layer, which is where the shape bugs live and which needs no DOM:
`adaptMovie`, `adaptMovieDetail`, `adaptReview`, `adaptPerson`, plus `compactCount`,
`timeAgo`, and `hueFor`. Vitest, a fixtures file of real TMDb payloads, an afternoon of
work, and every future TMDb shape change gets caught at the boundary. **Effort: M.**

**Lint the backend.** `npx eslint src/` is clean, but the backend is not covered by the
frontend flat config, so `npx eslint backend/src/` reports seven false `process is not
defined` errors and would hide real ones. Add a `languageOptions.globals: node` block for
`backend/**`. **Effort: S.**

**Commit.** Everything since `da1a18a` (2026-08-14) is uncommitted: the chatbot, accounts,
the Supabase migration, the mobile pass, and both For You rebuilds, roughly 2,150 added
lines across 28 tracked files plus 15 new ones. That is a lot of unrecoverable work sitting
in one working tree, and it makes any future bisect useless. Break it into the commits the
changelog entries already describe. **Effort: S**, and it is the most urgent item on this
page.

**Deploy config.** The Supabase migration entry describes the intended two-project Vercel
shape but no `vercel.json` exists on either side, so the deploy is undocumented in the repo
itself. **Effort: S.**
