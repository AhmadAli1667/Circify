import { ArrowUpDown, Calendar, Clapperboard, Heart, Link2, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { actorsBySlug } from '../data/actors'
import SafeImage from './SafeImage'
import { useMovies } from '../store'

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'
const FALLBACK_AVATAR = 'https://picsum.photos/seed/flixmate-fallback-avatar/300/400'

const SORT_OPTIONS = [
  { id: 'rating-desc', label: 'Rating (High to Low)' },
  { id: 'year-desc', label: 'Year (Newest First)' },
  { id: 'year-asc', label: 'Year (Oldest First)' },
  { id: 'title-asc', label: 'Title (A to Z)' }
]

const sortCredits = (credits, sortBy) => {
  const working = [...credits]
  if (sortBy === 'year-desc') return working.sort((a, b) => b.year - a.year || b.rating - a.rating)
  if (sortBy === 'year-asc') return working.sort((a, b) => a.year - b.year || b.rating - a.rating)
  if (sortBy === 'title-asc') return working.sort((a, b) => a.title.localeCompare(b.title))
  return working.sort((a, b) => b.rating - a.rating || b.year - a.year)
}

function ActorPage({ actorSlug }) {
  const actor = actorsBySlug[actorSlug]
  const { movies, getEffectiveRating } = useMovies()
  const [sortBy, setSortBy] = useState('rating-desc')

  const combinedCredits = useMemo(() => {
    if (!actor) return []
    const creditsByTitle = new Map()
    actor.movieCredits.forEach((credit) => creditsByTitle.set(credit.title, { ...credit }))
    movies
      .filter((movie) => movie.leadCast.includes(actor.name))
      .forEach((movie) => {
        const existing = creditsByTitle.get(movie.title)
        creditsByTitle.set(movie.title, {
          title: movie.title, year: movie.year,
          rating: getEffectiveRating(movie),
          role: existing?.role || 'Lead Cast',
          posterUrl: movie.posterUrl
        })
      })
    return sortCredits(Array.from(creditsByTitle.values()), sortBy)
  }, [actor, movies, getEffectiveRating, sortBy])

  if (!actor) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8">
        <div className="rounded-2xl border border-white/10 bg-surface/70 p-8 text-center">
          <p className="text-xl font-semibold text-white">Actor not found</p>
          <p className="mt-2 text-sm text-muted">Try opening a profile from the Top Cast section.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1300px] space-y-8 px-4 py-6 md:px-8">
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-surface/60">
        <div className="grid gap-6 p-5 md:grid-cols-[260px,1fr] md:p-8">
          <SafeImage src={actor.imageUrl} fallbackSrc={FALLBACK_AVATAR} alt={actor.name} className="h-[320px] w-full rounded-2xl object-cover" />
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary">Actor Profile</p>
              <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">{actor.name}</h1>
              <p className="mt-2 text-sm text-muted">Known For: {actor.knownForRole}</p>
            </div>
            <div className="space-y-3 text-sm leading-7 text-white/90">
              {actor.biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,330px]">
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Clapperboard size={19} className="text-primary" /> Filmography
            </h2>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
              <ArrowUpDown size={14} className="text-primary" /> Sort
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-sm text-white">
                {SORT_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            {combinedCredits.map((credit) => (
              <article key={`${credit.title}-${credit.year}`} className="grid gap-3 rounded-xl border border-white/10 bg-black/25 p-3 md:grid-cols-[68px,1fr]">
                {credit.posterUrl ? (
                  <SafeImage src={credit.posterUrl} fallbackSrc={FALLBACK_POSTER} alt={credit.title} className="h-20 w-16 rounded-md object-cover" />
                ) : (
                  <div className="flex h-20 w-16 items-center justify-center rounded-md bg-black/35">
                    <Clapperboard size={16} className="text-muted" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{credit.title}</p>
                  <p className="mt-1 text-sm text-muted">{credit.role}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Calendar size={13} /> {credit.year}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={13} className="text-primary" /> {credit.rating}/10</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-surface/60 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-white">Quick Facts</h2>
          <div className="mt-4 space-y-4 text-sm">
            {[
              { label: 'Age', value: actor.age, icon: <UserRound size={14} className="text-primary" /> },
              { label: 'Spouse', value: actor.spouse },
              { label: 'Parents', value: actor.parents.join(', ') }
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-1 flex items-center gap-2 text-white">{icon}{value}</p>
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-xs uppercase tracking-wide text-muted">Social Links</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(actor.social).map(([key, link]) => (
                  <a key={key} href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-xs text-white transition hover:border-primary">
                    <Link2 size={12} className="text-primary" /> {key}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default ActorPage
