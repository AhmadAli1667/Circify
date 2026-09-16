# Changes

Running log of what changed and why. Newest first.

## 2026-09-16: Supabase keepalive cron, and a Vercel deploy readiness pass

**What:** User wants to publish on Vercel and asked specifically for something to stop
Supabase's free-plan project from auto-pausing after 7 days of no API activity (confirmed
against current Supabase/Vercel docs rather than assumed, since the user's own estimate of
the inactivity window was off).

**New:** `backend/supabase/keepalive.sql` - a single-row `keepalive` table (`id` pinned to
`1`, `pinged_at`). `backend/src/routes/cron.js` - `GET /api/cron/keepalive` upserts that row
via `supabaseAdmin`, guarded by comparing the `Authorization` header against `CRON_SECRET`
(Vercel sends this automatically as a bearer token on cron invocations once the env var is
set; the check is skipped if `CRON_SECRET` is unset, so local dev needs nothing extra).
Registered in `server.js`. `backend/vercel.json` schedules it daily at 05:00 UTC via Vercel
Cron - once a day is comfortably inside both the 7-day pause window and the Hobby plan's
once-per-day cron limit. `.env.example` documents `CRON_SECRET`.

**Deploy readiness checked, not yet done:** confirmed Express still deploys to Vercel
zero-config (no `vercel.json` needed for that part, only for the `crons` block), and ran
`npm run build` clean. Still outstanding before a real deploy: the ~14 modified/untracked
files in the working tree are uncommitted (Vercel deploys from git), `keepalive.sql` needs
running in Supabase's SQL editor alongside the existing `migration.sql`, and both Vercel
projects need their env vars set (frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_API_BASE`; backend: everything in `.env.example` including the new `CRON_SECRET`,
plus `ALLOWED_ORIGINS` pointed at the frontend's real Vercel URL once it exists).

## 2026-08-21: Inventory of everything uncommitted since `da1a18a`

Not a change in itself, a stocktake. The last commit is `da1a18a` (2026-08-14, "Adding
TMDB connection to port initializing initial build"). Everything below is uncommitted
working-tree state: 28 tracked files modified (~2,150 insertions, ~660 deletions, excluding
lockfiles) and 15 new files. Each line points at the dated entry that explains the why.

**New files, backend:**
- `src/middleware/auth.js` - `requireAuth`, verifies the `Authorization: Bearer` Supabase
  access token via `getClaims`, attaches `req.user` and an RLS-scoped `req.supabase`.
  (Supabase migration entry. Replaced an earlier cookie-session version of this same path.)
- `src/routes/chat.js`, `src/routes/watchlist.js`, `src/routes/ratings.js` - the three
  account-scoped routers. (Chatbot entry, rewritten onto Supabase by the migration entry.)
- `src/services/gemini.js` - the assistant itself: `gemini-3.7-flash` over the Interactions
  API with `search_movies` and `respond` tools, guardrail and taste keywords in the system
  instruction, plus the no-em-dash writing rule. (Chatbot entry, dash fix in the migration
  entry.)
- `src/services/taste.js` - per-user taste profile computed on read from watchlist/ratings
  keywords, weighted by recency and rating. (Chatbot entry.)
- `src/services/keywords.js` - TMDb `/movie/{id}/keywords` proxy plus its `movie_keywords`
  cache table. (Chatbot entry.)
- `src/services/supabase.js` - `supabaseAnon`, `supabaseAsUser(token)`, `supabaseAdmin`.
  (Supabase migration entry.)
- `supabase/migration.sql` - `watchlist`, `ratings`, `chat_messages`, `movie_keywords`, each
  with its `auth.uid() = user_id` RLS policy. Run once in Supabase's SQL editor. (Supabase
  migration entry.)

**New files, frontend:**
- `.env.example` - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`. (Supabase
  migration entry.)
- `src/app/supabaseClient.js` - the browser Supabase client. (Supabase migration entry.)
- `src/app/authApi.js` - signup/login/logout wrappers plus `normalizeUser`. (Chatbot entry,
  rewritten onto Supabase Auth by the migration entry.)
- `src/app/useMovieReviews.js` - on-demand, module-cached TMDb reviews for one movie. (For
  You reference-layout entry.)
- `improvements.md` - ranked backlog of what to fix next, written 2026-08-21.

**Modified, backend:**
- `.env.example` - added `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`.
- `package.json` - added `@google/genai` and `@supabase/supabase-js`. (`bcryptjs` and
  `cookie-parser` were added and then removed inside this same window, so they leave no
  trace in the diff.)
- `src/server.js` - mounts the chat/watchlist/ratings routers; CORS moved from wide-open
  `cors()` to an `ALLOWED_ORIGINS`-driven allowlist.
- `src/routes/movies.js` - two new routes: `GET /:id/keywords` (chatbot entry) and
  `GET /:id/reviews` (For You reference-layout entry).

**Modified, frontend core:**
- `package.json` - added `@supabase/supabase-js`.
- `src/App.jsx` - `immersive` check hides `Navbar` and `ChatWidget` for For You on mobile.
- `src/index.css` - `.fm-page-pad` and its 720px media query.
- `src/app/store.jsx` - the largest single diff: account bootstrap through
  `supabase.auth.onAuthStateChange`, watchlist/ratings/chat history hydrated from the
  backend instead of localStorage, `toggleWatch`/`setRating`/`doChat` gated on a signed-in
  user, `vibePick()` deleted in favour of the real assistant.
- `src/app/tmdbApi.js` - `VITE_API_BASE`, the bearer-token `authed()` helper and the
  account-scoped calls, plus `getMovieKeywords` and `getMovieReviews`.
- `src/app/ui.js` - `MOBILE_BREAKPOINT` and `useIsMobile`, `CHAT_WAIT_PHRASES`,
  `compactCount`, `timeAgo`; `REVIEW_POOL`'s comment now records that only the movie modal
  still uses it.
- `src/app/catalog.js` - `adaptReview` and `cleanReviewText`.

**Modified, components:**
- `src/components/Navbar.jsx` - real signed-in user instead of the hardcoded "Alex Rivera",
  working sign-out, hamburger menu below 720px, dropdowns clamped to viewport width, and it
  now publishes its measured height as `--fm-navbar-h` via `ResizeObserver`.
- `src/components/WizardRail.jsx` - click-to-pin on desktop, FAB plus bottom sheet on
  mobile, replacing hover-only controls that touch devices could never open.
- `src/components/ChatMessages.jsx` - `WaitIndicator`, the rotating wait copy.
- `src/components/MovieModal.jsx` - `SplitBanner` stacks to a centred column below 720px.

**Modified, screens:**
- `src/screens/ForYou.jsx` - rebuilt twice in this window: first full-bleed Shorts-style,
  then to the two-column reference layout with real TMDb reviews as the comments.
- `src/screens/Auth.jsx` - wired to the real signup/login actions (was UI-only).
- `src/screens/Chat.jsx` - sizes against `--fm-navbar-h`, real user's name in the greeting.
- `src/screens/Home.jsx` - fluid `clamp()` hero, no longer reserves the wizard rail's left
  padding on mobile.
- `src/screens/Actor.jsx` - responsive header alongside the padding change.
- `src/screens/CastCrew.jsx`, `Friends.jsx`, `Profile.jsx`, `Search.jsx`, `Settings.jsx`,
  `Theatres.jsx`, `Watchlist.jsx` - the shared `.fm-page-pad` swap, nothing else.

**Deleted inside this window** (created after the last commit, then removed, so the diff
does not show them at all): `backend/src/db.js` (the `node:sqlite` layer),
`backend/src/routes/auth.js` and the cookie-session middleware, and the `users`/`sessions`
tables. All superseded by Supabase Auth.

**Also present in the repo, unrelated to Flixmate:** untracked `QReadify/` and
`circify/breadboard-concept.html` at the repository root, from other projects sharing this
repo.

## 2026-08-21: For You rebuilt to the reference layout, with real reviews as the comments

**What:** User shared a YouTube Shorts screenshot (video left, action rail beside it,
comments panel right) and asked For You to match it, with reviews reading as comments
that carry a star rating inline with the name, and with the soft rounded shapes dropped.

**Layout (`src/screens/ForYou.jsx`, rewritten):** the feed and the reviews panel now sit
side by side as one centred group, matching the reference. The card column is a 9:16
frame sized off viewport height, snap-scrolled, with a sliver of the next pick showing
below it. The action rail moved out of the card and beside it on desktop (it stays
overlaid at phone width, there's no room next to the frame), and it is now a single rail
owned by whatever card is on screen rather than one per card. Paging arrows sit at the
right edge, as in the reference. The panel stays open and re-fills itself as the feed
scrolls instead of being opened per movie; on mobile it is a bottom sheet.

**Shapes:** 4px on surfaces, 2px on controls, circles only where a short-form feed
actually uses them (the rail's glyph buttons, avatars). The rounded pills, 12-20px
radii and blurred blobs are gone. Emoji glyphs were replaced with a small inline-SVG
icon set so the rail and the comment rows read as one family at small sizes.

**Reviews are real now:** new `GET /api/movies/:id/reviews` (TMDb proxy), `adaptReview`
in `catalog.js`, and `useMovieReviews.js` (same on-demand + module-cache shape as
`useMovieDetails`, fetched only for the active card). Each row renders TMDb's author
handle, avatar, score out of 10 as a half-step star strip beside the name, relative
timestamp, body (clamped with Read more), and a link to the review on TMDb. Sorting
between top-rated and newest is real. Titles with no TMDb reviews get an honest empty
state rather than filler. `REVIEW_POOL` sample data is no longer used here at all, it
now only backs the movie modal's Reviews tab.

**Honest edges kept honest:** the composer's star row writes a real rating through
`setRating` (so it saves to the account), the text field says written reviews aren't
wired up yet, per-review Helpful/Reply are local-only since TMDb exposes no vote counts,
and the like count on the rail is labelled as what it is, TMDb votes.

**Other fixes along the way:** the trailer `<iframe>` is `pointer-events: none`, so a
wheel or swipe over the video scrolls the feed instead of being eaten by the embed (and
YouTube's hover chrome stays out of the frame); landscape trailers sit letterboxed over
a blurred fill of the title's own art instead of dead black.

**Verified** over CDP in headless Chrome at 1600x900 and 390x844: feed paging, the panel
following the active card, real reviews rendering with stars (Spider-Man: Brand New Day,
12 reviews), the empty state (Rage of Stars, 0), the panel-closed layout re-centring, and
the mobile bottom sheet. No console errors, `npx eslint src/` clean, `vite build` clean.
The reviews route was exercised against live TMDb (`/api/movies/155/reviews`, 16 rows).

## 2026-08-20: Shorts-accurate For You feed, plus a site-wide mobile pass

**What:** User shared their current For You screen (a soft, rounded, drop-shadowed card
floating in a light page) next to a real YouTube Shorts screenshot and asked for it to
actually match, plus a genuine mobile pass across the app, which had zero responsive
handling anywhere until now (no media queries, no breakpoints, fixed pixel padding on
every screen). Full plan: `C:\Users\Ahmad Ali\.claude\plans\calm-frolicking-lemur.md`.

**For You (`src/screens/ForYou.jsx`) rebuilt full-bleed:** dropped the `maxWidth:400`/
`borderRadius:26`/`boxShadow` card look, the viewer now sits on a solid near-black surface
regardless of the app's light/dark theme (an immersive video viewer reads as its own
thing, not themed page chrome). Removed the "Tailored to you / For You, Alex" heading
block entirely (real Shorts has none, and it was the thing "not there" once you started
scrolling, a page-flow element above a now full-bleed feed), replaced with a minimal
overlaid back button. Consolidated the old two separate floating controls (prev/next
arrows positioned via a card-relative `calc()`, and a Like/Save/Share row inside the card)
into one right-edge action rail matching the reference. "Comments" became "Reviews &
discussions", same honestly-labeled `REVIEW_POOL` sample data, restyled to match the
reference: a side drawer on desktop (video keeps playing beside it), a bottom sheet on
mobile (matching how Shorts/Reels actually present this at phone width, the reference
screenshot was the desktop web layout). On mobile the feed is a true full-screen
takeover, `Navbar`/`ChatWidget` hidden via a new `immersive` check in `App.jsx`
(`useIsMobile() && screen === 'foryou'`), the existing `scrollSnapType: 'y mandatory'`
mechanics were already there and just needed a genuinely full-viewport container to
deliver "one scroll stops at the next page." Also fixed the hardcoded `"For You, Alex"`,
same bug as the earlier `Navbar.jsx`/`Chat.jsx` fixes below.

**New shared responsive foundation** (`src/app/ui.js`, `src/index.css`): one breakpoint,
720px (`MOBILE_BREAKPOINT`, `useIsMobile()` hook via `matchMedia`) for places that need to
mount different JSX, and a `.fm-page-pad` CSS class (40px above the breakpoint, 18px
below) for the repeated inline padding literal found on 9 screens, following the existing
convention of a shared `.fm-*` class for the handful of things inline style can't do
(alongside `.fm-scroll`/`.fm-clamp-2`). Also: `Navbar.jsx` now measures its own real
rendered height via `ResizeObserver` and publishes it as `--fm-navbar-h`, so `ForYou`/
`Chat.jsx` size against the actual value instead of a hardcoded guess that would desync
the moment the navbar's own height changes, which the mobile rework below does.

**Site-wide mobile fixes**, ranked by severity from a parallel Explore survey of every
screen/component:
1. `Navbar.jsx`: below 720px the nav links and search collapse behind a hamburger button
   into a full-width slide-down panel; the two right-anchored dropdowns (search filters,
   avatar menu) now clamp to `min(Npx, calc(100vw - 32px))` instead of a fixed width that
   could clip off a narrow screen.
2. `WizardRail.jsx`: was `onMouseEnter`/`onMouseLeave`-only, not just cramped on touch but
   structurally unreachable (`mouseenter` doesn't fire on touch devices), the single
   biggest functional bug found. Desktop keeps hover plus a new click-to-pin toggle on the
   collapsed rail; mobile gets a round FAB trigger and a bottom sheet with a backdrop
   instead of the fixed 60px rail that was permanently reserving `Home`'s left padding.
3. `MovieModal.jsx`'s `SplitBanner` (the no-backdrop layout: concert films, some
   documentaries) had no `flexWrap`, squeezing the text column to roughly 67px at 375px.
   Stacks to a centered column below 720px now.
4. `Home.jsx`'s hero: fixed `height:462` and unclamped `fontSize:68` title switched to
   `clamp()`-based fluid sizing, and it no longer inherits `WizardRail`'s reserved left
   padding on mobile now that the rail isn't fixed-position there.
5. `Chat.jsx`'s `calc(100vh - 130px)` (hardcoded against Navbar's old single-row height,
   would've desynced the moment Navbar's mobile rework shipped) now reads
   `calc(100dvh - var(--fm-navbar-h, 70px))` instead. Also fixed its own hardcoded
   `"Hi Alex, what should we watch?"`.

**Explicitly left alone**, per the survey: `TrailerModal`, `ShareModal`, `ActiveChips`,
`primitives.jsx`, `RowScroller`, `Settings.jsx`, `Friends.jsx`, `Theatres.jsx`, and the
`RESULT_GRID` grids everywhere, all already fine or low-severity, no sense padding the
diff.

**Verified** via headless-Chromium at both a desktop (1280px) and mobile (390x844)
viewport: For You full-bleed styling, the action rail, both Reviews panel forms (desktop
side drawer confirmed showing 4 real entries with the video still playing beside it,
mobile bottom sheet), the hamburger menu opening/closing, the WizardRail bottom sheet
opening via tap with all its filters intact, and the SplitBanner stacking fix (found a
real backdrop-less title, "Kevin Bridges: Live at the Commonwealth", and confirmed it
stacks on mobile while staying side-by-side on desktop, unchanged). Also caught, and
confirmed was a false alarm rather than a layout bug: a screenshot appeared to show two
feed cards overlapping, computed `getBoundingClientRect()` showed the sizing was pixel-
perfect (`scrollTop: 0`, each item exactly filling the viewport), it was YouTube's own
iframe overlay chrome (title card, pause button), not my code.

## 2026-08-20: Rotating wait-copy for chat's typing indicator

**What:** The chat typing indicator (`src/components/ChatMessages.jsx`) now cycles through
reassuring copy ("Thinking…" -> "Checking your taste…" -> "Searching movies…" -> …, new
`CHAT_WAIT_PHRASES` in `src/app/ui.js`) every 4s instead of showing bare animated dots the
whole time. **Why:** replies can take 8 to 65+ seconds (see the Gemini migration's known
latency issue below), and static dots for that long read as hung. New `WaitIndicator`
subcomponent, `key={state.chatMsgs.length}` so each new wait remounts it and restarts at
phrase 0 rather than resetting state inside an effect (the latter trips the
`react-hooks/set-state-in-effect` lint rule for good reason, this is the idiomatic fix).
**Verified** in a headless-Chromium run: captured the visible phrase at three points during
a real wait and confirmed it advanced ("Thinking…" at t=1.5s, "Checking your taste…" at
t=6s, "Searching movies…" at t=10.5s).

## 2026-08-20: Migrated accounts/data off node:sqlite onto Supabase, Vercel-ready

**What:** User wants to deploy Flixmate publicly on Vercel. `node:sqlite` is a local file,
it doesn't survive Vercel's serverless filesystem, and the custom bcrypt/cookie-session auth
from the previous entry gets awkward across the two separate origins a Vercel deploy
produces (frontend site, backend API). Swapped both for Supabase (hosted Postgres + Auth).
Full plan: `C:\Users\Ahmad Ali\.claude\plans\calm-frolicking-lemur.md`.

Researched against current docs rather than assumed, same lesson as the Gemini integration:
Vercel now has zero-config Express support (deploys whatever exports the `app`, or just
calls `app.listen(...)`, which `server.js` already did, no rewrite into serverless
functions needed), and Supabase's current recommended server-side token check is
`supabase.auth.getClaims(jwt)` (verifies locally against the project's JWKS), not the older
`getUser(token)`. Confirmed exact shapes against the installed `@supabase/supabase-js`
package's own source rather than guessed.

**Auth moved entirely to Supabase Auth**, called directly from the frontend via
`@supabase/supabase-js`. Deleted the custom `backend/src/routes/auth.js` and the old
cookie-session `middleware/auth.js`, `sessions`/`users` tables gone too, Supabase's SDK
already handles signup/login/session storage/token refresh. Display name lives in Supabase
user metadata now, not a users table column. Auth transport changed from an httpOnly
cookie to a bearer token (`Authorization: Bearer <access_token>`), sidesteps cross-origin
cookie/CORS complexity once frontend and backend are on different Vercel domains.

**Row Level Security, not just backend filtering.** `watchlist`/`ratings`/`chat_messages`
each get a `auth.uid() = user_id` policy (new `backend/supabase/migration.sql`, run once in
Supabase's SQL editor). The backend verifies a request's JWT via `getClaims`, then builds a
Supabase client carrying that same JWT (new `backend/src/services/supabase.js`,
`supabaseAsUser(token)`) for those tables' queries, so access control is enforced at the
database, not just by remembering a `.eq('user_id', ...)` filter everywhere.
`movie_keywords` (a shared TMDb cache, not user data) is the one table the backend writes
with the service role key (`supabaseAdmin`), since it isn't scoped to any user.

**Backend routes rewritten** (`watchlist.js`, `ratings.js`, `chat.js`, `services/taste.js`,
`services/keywords.js`) to use the Supabase query builder instead of `db.prepare(...)`.
`services/gemini.js` untouched, it never touched the database directly. `server.js`: CORS
narrowed from a hardcoded single origin to an `ALLOWED_ORIGINS` env var, bearer tokens don't
need cookie-style credentialed CORS.

**Frontend:** new `src/app/supabaseClient.js`; `authApi.js` rewritten to wrap
`supabase.auth.signUp`/`signInWithPassword`/`signOut` instead of calling the now-deleted
`/api/auth/*` routes; `tmdbApi.js`'s `authed()` helper reads the current session's access
token via `supabase.auth.getSession()` on each call instead of sending a cookie, and
`API_BASE` is now `VITE_API_BASE`-configurable for pointing at a deployed backend.
`store.jsx`'s account bootstrap subscribes to `supabase.auth.onAuthStateChange` (handles
token refresh automatically) instead of polling a `/api/auth/me` route.

**Deploy shape:** two separate Vercel projects from this repo, root directory `/` for the
Vite frontend and `backend/` for the Express API, each with its own URL, Vercel's standard
pattern for this shape rather than folding everything into one project.

**Known trade-off, called out up front:** local dev now needs a real Supabase project, no
self-hosted stand-in was set up (Docker-based local Supabase would be overkill here), so
`npm run dev` talks to the same hosted project as production would. The backend (and now
the frontend too, `supabaseClient.js` constructs its client eagerly at load) won't even boot
without real `SUPABASE_URL`/`VITE_SUPABASE_URL` values, confirmed by trying: an empty
`supabaseUrl` throws immediately at `createClient(...)`, unlike the Gemini key which only
failed on first use.

**Verified against the real project** once the user supplied credentials (the URL they
first pasted was the dashboard link, not the API URL, fixed to `https://<ref>.supabase.co`):
login issues a bearer token and every RLS-scoped query (watchlist/ratings/chat history)
succeeds; watchlisting a movie writes a row and populates `movie_keywords` via the service
role client (confirmed directly against the table); chat returns real, well-grounded picks
(e.g. asking for "moody, slow-burn" correctly returned The Batman / Shutter Island / Se7en)
and the guardrail correctly declines off-topic requests instead of answering them. Test
account created pre-confirmed via the admin API (`auth.admin.createUser` with
`email_confirm: true`) rather than asking the user to disable email confirmation on their
project just for my testing, then deleted afterward.

**Bug found and fixed:** the model's replies used em dashes, violating the project's
standing "never use em/en dashes" rule, since nothing in the prompt said not to. Added an
explicit writing-style instruction to `buildSystemInstruction` in `services/gemini.js`,
confirmed fixed on the next request.

**Known issue, not yet addressed:** response latency is high and inconsistent, 8 to 65
seconds observed across identical-shape requests (a plain guardrail decline once took 8s,
another time 50s; a recommendation needing two tool-call rounds took 63s). The UI's typing
indicator correctly stays up the whole time (no premature timeout), so nothing breaks, but
it reads as hung to a user. Not investigated further yet, worth a follow-up look at
`gemini-3.7-flash`'s thinking/effort configuration on the Interactions API, or restructuring
so the first `search_movies` candidates get fetched before the first model call instead of
costing a full round trip.

## 2026-08-19: Real chatbot, real accounts, per-user taste profiles

**What:** Replaced the local `vibePick()` regex-over-genre matcher (`src/app/store.jsx`)
with a real conversational assistant, and built real signup/login to back it, since the
whole point was recommendations grounded in each user's own taste. Full plan:
`C:\Users\Ahmad Ali\.claude\plans\calm-frolicking-lemur.md`.

**Backend (new):** `backend/src/db.js` opens a `node:sqlite` `DatabaseSync` at
`backend/data/flixmate.db` (Node's built-in module, zero new native dependency, verified
working on Node v24.14.0) with `users`/`sessions`/`watchlist`/`ratings`/`chat_messages`/
`movie_keywords` tables. `backend/src/routes/auth.js` + `backend/src/middleware/auth.js`:
email/password signup and login, `bcryptjs` hashing, opaque session tokens in an `httpOnly`
cookie. `backend/src/routes/watchlist.js` and `ratings.js` move those two out of
`localStorage` and behind `requireAuth`. `backend/src/services/keywords.js` proxies and
caches TMDb's real `/movie/{id}/keywords` (new `GET /api/movies/:id/keywords`).
`backend/src/services/taste.js` computes a user's taste profile on read: their
watchlist/ratings' cached keywords, weighted so recent adds and high ratings count more,
reduced to the top ~15. `backend/src/services/gemini.js` calls Gemini's free tier
(`gemini-3.7-flash` via `@google/genai`'s Interactions API,
`client.interactions.create`/`function_call`/`function_result` steps, confirmed against the
installed package's own `.d.ts` rather than guessed) with two tools: `search_movies`
(backend runs a real TMDb discover/search, so the model can never hand back an invented
title) and `respond` (the model must call this exactly once to finalize its reply and
picks). The system instruction carries the guardrail ("decline anything outside movies,
in one in-character sentence") and the taste-profile keywords. `backend/src/routes/chat.js`
wires it together and persists both sides of every turn to `chat_messages`, so
conversations now survive a reload. `server.js` CORS narrowed from wide-open to
`{ origin: 'http://localhost:5173', credentials: true }` since cookies need that.

**Frontend:** new `src/app/authApi.js` (signup/login/logout/me) and the matching
account-scoped calls in `src/app/tmdbApi.js`. `store.jsx` hydrates `state.user` +
watchlist/ratings/chat history from the backend on load instead of `localStorage` for
those three; `toggleWatch`/`setRating`/`doChat` now gate on `state.user` (prompt to sign
in + nav to Auth when signed out) and sync to the backend instead of writing local-only
state. `Auth.jsx` wired to the real `signup`/`login` actions (was UI-only, always dropped
you into a hardcoded "demo profile"). `Navbar.jsx`'s avatar menu showed a hardcoded "Alex
Rivera" regardless of who was using the app, now shows the real signed-in user's name and
initials, and its "Sign out" row actually calls `logout()`.

**Verified** via headless-Chromium (Playwright, `chromium-cli` wasn't available so drove it
directly): signed up a fresh account, avatar menu updated from "Guest" to the real name
immediately, sent a chat message, confirmed the whole pipeline runs (auth gate, `POST
/api/chat`, taste-profile computation, the Gemini call itself, graceful fallback copy on
failure) end to end. Also verified directly against the backend: signup sets a working
session cookie, watchlisting a movie triggers real TMDb keyword caching, and the taste
profile computes sensible weighted keywords from it. The model replies themselves are
unverified, no `GEMINI_API_KEY` is configured yet, that's on the user to add.

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
