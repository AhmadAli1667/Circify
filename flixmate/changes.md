# Changes

Running log of what changed and why. Newest first.

## 2026-08-14: Browsing, modal, and search overhaul

**What:** A large batch of feedback from actually using the app after the TMDb
integration landed. Full plan (same file the previous two entries used):
`C:\Users\Ahmad Ali\.claude\plans\kind-marinating-puffin.md`.

**Fixed a real bug:** the movie modal was stretching the portrait poster into a wide
360px banner instead of using the real landscape backdrop image (`backdropUrl`) that
was already being fetched and just never wired in. Home's hero had the same problem.
Both now use the real backdrop photo when TMDb has one; when a title genuinely has no
backdrop (concert films, some documentaries), the modal switches to a horizontal split
layout instead, info on the left, the poster shown at its real 2:3 aspect on the
right, so nothing gets cropped or stretched into a ratio it wasn't shot for.

**Home page rebuilt** around real TMDb discover queries instead of 3 fixed rows:
Trending, Recommended (personalized, unchanged logic), then Action/Comedy/Horror/
Kids & Family/Rom-Coms/Sci-Fi/Documentaries, each backed by
`GET /api/discover?with_genres=`. New `src/app/usePaginatedList.js` (generic "keep
loading more" pagination hook, dedupes by id) backs each row's "See all", which now
has an actual "Load more" button that keeps paging in fresh titles instead of
stopping at a hard-coded slice of 18. New `src/components/RowScroller.jsx` hides the
native scrollbar and adds hover-revealed prev/next arrows, replacing raw drag-scroll
rows everywhere (Home, the modal's "More like this").

**Movie modal restructured into tabs** (Overview / Where to watch / Reviews) with a
slide transition, instead of one long scrolling stack. New "View full cast & crew"
link opens a dedicated `src/screens/CastCrew.jsx` page (new `state.castCrewId` +
`openCastCrew` action) showing the complete cast and crew (all billed actors, crew
grouped by department), not just the modal's top-8 preview.

**Franchise/studio search:** typing "marvel", "dc", "disney" etc. now surfaces that
studio's catalogue, not just titles with the word in it. New backend
`GET /api/search/company` resolves the studio name to a TMDb company id, then
`GET /api/discover?with_companies=` pulls its movies, merged into live search
results. Hit one real bug here: the local text-match filter in `results` was
re-checking every merged movie's title/cast against the typed query and silently
dropping anything that matched by studio rather than by title (e.g. "Spider-Man"
doesn't contain "marvel"), the fix tracks which ids came pre-matched from live search
and skips the redundant local text check for those.

**Search no longer dead-ends:** empty/in-flight results show an animated "Searching…"
(reusing the existing chat typing-dots keyframe) or a "here's what's popular right
now" suggestion strip instead of a bare "no results" panel.

**For You feed:** dropped the always-visible star rating and review snippets in
favor of a three-way Poster/Trailer/Comments tab. Whichever card is centered in the
viewport (`IntersectionObserver`, 60% threshold) auto-switches to Trailer and
autoplays it muted, TikTok/Reels-style, with a tap-to-unmute button. The feed itself
is no longer capped at 10, it's paginated against TMDb's popular list via
`usePaginatedList` and keeps extending as the user scrolls near the bottom.

**Trailer fallback copy simplified:** when a title has no trailer, the modal just
says to watch it on YouTube, it no longer explains that TMDb doesn't have one.

**Dashes:** swept the entire codebase (`src/` and `backend/`, including this file)
for em/en dashes and rewrote every instance with periods, commas, colons, or
parentheses, per a new standing rule (saved to memory, applies to all future work,
any project): never use em dashes (—) or en dashes (–) anywhere.

**Verified** via headless-Chrome/CDP: all 9 Home rows render with real backdrop hero,
a genre row's "Load more" genuinely fetched a fresh page (155 to 175 loaded posters),
"marvel" search returned 22 real Marvel Studios titles (Spider-Man, Avengers, Iron
Man, none of which contain the word "marvel" in their title) after the filter fix, an
empty/nonsense search showed the suggestion strip instead of a dead end, the modal's
tabs and cast & crew page loaded real data (26 cast, 416 crew for a concert film), no
console errors, `npx eslint src/` clean, zero em/en dashes remaining.

## 2026-08-13: TMDb backend wired up and verified

**What:** Fixed the TMDb API key not reaching the backend, installed backend deps,
started `backend/src/server.js`, and confirmed all 8 existing routes (`/api/trending`,
`/api/search`, `/api/movies/:id` + `/videos` + `/credits` + `/providers`,
`/api/people/:id` + `/credits`) return real data.

**Why:** The key had been pasted into `flixmate/.env` (repo root) as free-text notes,
not `KEY=value` syntax, and even formatted correctly, that's the wrong file.
`backend/src/services/tmdb.js` loads `dotenv/config` from `backend/`'s cwd, and no
`backend/.env` existed. The frontend doesn't read any env var at all, so the root
`.env` was never consulted for anything either way.

**Changed:**
- Created `backend/.env` with `TMDB_API_KEY` and `PORT` set correctly.
- Added `.env` to the root `.gitignore` (only `backend/.gitignore` had it before).
- `npm install` in `backend/` (no `node_modules` existed).

## 2026-08-13: Replaced the fake catalogue with live TMDb data everywhere

**What:** Deleted `src/data/movies.js`/`actors.js` (112 titles, 69 algorithmically
generated with wrong years/genres/synopses) and rewired every screen to run on real
TMDb data via the backend.

**Why:** User request, following on from the backend wiring fix above. Full plan at
the time: `C:\Users\Ahmad Ali\.claude\plans\kind-marinating-puffin.md`.

**Architecture:** two-tier movie shape.
- **List-tier** (`adaptMovie` in `src/app/catalog.js`): id/title/year/rating/genres/
  poster/synopsis, available instantly from any TMDb list endpoint (trending,
  popular, top-rated, now-playing, search, recommendations, a person's credits).
  `store.jsx` bootstraps a ~250-title browsing pool from these on mount
  (`state.movies`), and a debounced live `/api/search` call additionally reaches
  TMDb's full catalogue as the user types (`state.liveSearchResults`, merged into the
  pool only while a query is active), not just the loaded 250.
- **Detail-tier** (`adaptMovieDetail` / `adaptPerson`): cast, director, runtime, real
  trailer key, real watch-providers, real recommendations / real filmography, each
  needs its own per-id calls, so these load on demand via `useMovieDetails.js` /
  `usePersonDetails.js` (module-scoped cache, so repeat opens don't refetch) when a
  movie modal or actor page opens.
- **`state.movieCache`**: an accumulating `{id: movie}` registry, persisted to
  localStorage alongside watchlist/ratings, so a watchlisted title still renders after
  a reload even if it's since fallen out of the freshly-fetched pool.

**Backend additions:** `GET /api/discover/{popular,top_rated,now_playing}`,
`GET /api/genres`, `GET /api/movies/:id/recommendations`. The existing 8 routes
didn't cover enough of the catalogue or genre names to build a real browsing pool.

**Real upgrades along the way, beyond the straight data swap:**
- Movie modal's "Where to watch" now shows real regional streaming/rent/buy provider
  logos (was: three hardcoded illustrative badges).
- Trailer playback is a real embedded YouTube `<iframe>` when TMDb has one (was: a
  "coming soon" placeholder that only linked out to a YouTube search).
- "More like this" uses TMDb's actual recommendation graph (was: a local same-genre/
  same-era heuristic).
- Actor pages get a real photo, biography, birthday/place of birth, and full
  filmography for essentially every billed actor (was: only a handful of
  hand-curated actors had real bios, everyone else got a placeholder).

**Verified** via a headless-Chrome/CDP pass (Home real posters + trending,
live search reaching titles outside the pool, movie modal with real cast/runtime/
provider logos, actor page with real bio/filmography, embedded trailer playback,
watchlist surviving a reload), no console errors, `npx eslint src/` clean.

**Known scope boundary:** Theatres and ForYou cards intentionally stay list-tier only
(no runtime/cast shown there) rather than firing a detail fetch per card in those
grids, Home's hero (5 titles) and the movie modal are the only places that eagerly
enrich beyond list-tier. Friends' sample people/activity and ForYou's review pool
remain illustrative, unchanged, they're not catalogue data.
