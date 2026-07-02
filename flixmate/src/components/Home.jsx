import { motion } from 'framer-motion'
import { Film, Heart, Info, Play, SlidersHorizontal, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { topCast } from '../data/actors'
import SafeImage from './SafeImage'
import { useMovies } from '../store'

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'
const FALLBACK_AVATAR = 'https://picsum.photos/seed/flixmate-fallback-avatar/180/180'

function MovieCard({ movie, onOpen, effectiveRating }) {
  return (
    <button
      onClick={() => onOpen(movie)}
      className="group min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-surface text-left transition hover:scale-[1.03] hover:border-primary/60"
    >
      <SafeImage src={movie.posterUrl} fallbackSrc={FALLBACK_POSTER} alt={movie.title} className="h-[250px] w-full object-cover" />
      <div className="space-y-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-white">{movie.title}</p>
        <p className="text-xs text-muted">{movie.year}</p>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Star size={12} className="text-primary" />
          {effectiveRating}/10
        </div>
      </div>
    </button>
  )
}

function Home({ onOpenMovie }) {
  const { filteredMovies, rows, genres, filters, updateFilter, resetFilters, getEffectiveRating } = useMovies()
  const [heroIndex, setHeroIndex] = useState(0)

  const featuredList = useMemo(() => rows[0]?.movies?.slice(0, 8) || [], [rows])
  const featuredMovie = featuredList[heroIndex % Math.max(featuredList.length, 1)]

  useEffect(() => {
    if (!featuredList.length) return undefined
    const timer = setInterval(() => setHeroIndex((prev) => (prev + 1) % featuredList.length), 5000)
    return () => clearInterval(timer)
  }, [featuredList])

  const openActor = (slug) => { window.location.hash = `/actor/${slug}` }

  return (
    <main className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 md:grid-cols-[280px,1fr] md:px-8">
      <aside className="h-fit rounded-2xl border border-white/10 bg-surface/70 p-4">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" />
          <h2 className="font-semibold text-white">Discovery Wizard</h2>
        </div>

        <div className="space-y-4 text-sm">
          <label className="block">
            <span className="text-muted">Year Min: {filters.yearMin}</span>
            <input type="range" min="1950" max="2026" value={filters.yearMin} onChange={(e) => updateFilter('yearMin', Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="block">
            <span className="text-muted">Year Max: {filters.yearMax}</span>
            <input type="range" min="1950" max="2026" value={filters.yearMax} onChange={(e) => updateFilter('yearMax', Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="block">
            <span className="text-muted">Minimum Rating: {filters.minRating.toFixed(1)}</span>
            <input type="range" min="0" max="10" step="0.1" value={filters.minRating} onChange={(e) => updateFilter('minRating', Number(e.target.value))} className="mt-2 w-full" />
          </label>
          <label className="block">
            <span className="text-muted">Genre</span>
            <select value={filters.genre} onChange={(e) => updateFilter('genre', e.target.value)} className="mt-2 w-full rounded-md border border-white/15 bg-black/40 px-2 py-2 text-white">
              {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
          </label>
          <button onClick={resetFilters} className="w-full rounded-md border border-white/15 py-2 text-muted transition hover:border-primary hover:text-white">
            Reset Filters
          </button>
        </div>
      </aside>

      <section className="space-y-8">
        {featuredMovie && (
          <motion.div
            key={featuredMovie.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-white/15"
          >
            <SafeImage src={featuredMovie.posterUrl} fallbackSrc={FALLBACK_POSTER} alt={featuredMovie.title} className="h-[380px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent p-6 md:p-8">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Featured Now</p>
              <h1 className="max-w-xl text-3xl font-black text-white md:text-5xl">{featuredMovie.title}</h1>
              <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">{featuredMovie.synopsis}</p>
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => window.open(featuredMovie.trailerLink, '_blank', 'noopener,noreferrer')}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold"
                >
                  <Play size={14} /> Play
                </button>
                <button onClick={() => onOpenMovie(featuredMovie)} className="flex items-center gap-2 rounded-lg border border-white/25 bg-black/30 px-4 py-2 text-sm">
                  <Info size={14} /> More Info
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <section className="rounded-2xl border border-white/10 bg-surface/60 p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-2xl font-bold text-white">Top Cast</h2>
            <span className="text-sm text-muted">{topCast.length}</span>
          </div>
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {topCast.map((actor) => (
              <button
                key={actor.slug}
                onClick={() => openActor(actor.slug)}
                className="group relative grid grid-cols-[76px,1fr] items-center gap-4 rounded-xl border border-white/0 p-2 text-left transition hover:border-white/10 hover:bg-black/25"
              >
                <div className="relative">
                  <SafeImage src={actor.imageUrl} fallbackSrc={FALLBACK_AVATAR} alt={actor.name} className="h-[76px] w-[76px] rounded-full object-cover" />
                  <span className="absolute bottom-[-2px] right-[-2px] rounded-full bg-zinc-700 p-1 text-white">
                    <Heart size={12} className="text-white/90" />
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white group-hover:text-primary">{actor.name}</p>
                  <p className="text-lg text-muted">{actor.knownForRole}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {filteredMovies.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-surface p-8 text-center">
            <Film className="mx-auto mb-3 text-primary" />
            <p className="text-lg font-semibold text-white">No results found</p>
            <p className="mt-1 text-sm text-muted">Try changing search keywords or filters.</p>
          </div>
        )}

        {rows.filter((row) => row.movies.length > 0).map((row, idx) => (
          <motion.div key={row.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
            <h3 className="mb-3 text-lg font-semibold text-white">{row.title}</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {row.movies.map((movie) => (
                <MovieCard key={`${row.title}-${movie.id}`} movie={movie} onOpen={onOpenMovie} effectiveRating={getEffectiveRating(movie)} />
              ))}
            </div>
          </motion.div>
        ))}
      </section>
    </main>
  )
}

export default Home
