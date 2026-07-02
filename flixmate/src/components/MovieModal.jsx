import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, ListPlus, Star, X } from 'lucide-react'
import { actorSlugByName } from '../data/actors'
import SafeImage from './SafeImage'
import { useMovies } from '../store'

const FALLBACK_POSTER = 'https://picsum.photos/seed/flixmate-fallback-poster/420/620'

function StarRating({ current, onRate }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onRate(star * 2)} className="transition hover:scale-110" aria-label={`Rate ${star}`}>
          <Star size={18} className={current >= star * 2 ? 'fill-primary text-primary' : 'text-white/50'} />
        </button>
      ))}
    </div>
  )
}

function MovieModal({ movie, onClose }) {
  const { watchlist, toggleWatchlist, rateMovie, ratings, getSmartRecs } = useMovies()

  const openActor = (name) => {
    const slug = actorSlugByName[name]
    if (!slug) return
    onClose()
    window.location.hash = `/actor/${slug}`
  }

  return (
    <AnimatePresence>
      {movie ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/15 bg-white/10 p-4 shadow-glass backdrop-blur-2xl md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-white md:text-3xl">{movie.title}</h2>
              <button className="rounded-md p-1 text-muted hover:text-white" onClick={onClose}><X /></button>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[280px,1fr]">
              <SafeImage src={movie.posterUrl} fallbackSrc={FALLBACK_POSTER} alt={movie.title} className="h-[400px] w-full rounded-xl object-cover" />
              <div className="space-y-4">
                <p className="text-sm text-muted">{movie.year} • {movie.genre.join(' / ')} • Director: {movie.director}</p>
                <p className="text-sm text-white/90">{movie.synopsis}</p>
                <p className="text-sm text-muted">
                  Cast:{' '}
                  {movie.leadCast.map((name, index) => {
                    const slug = actorSlugByName[name]
                    const isLast = index === movie.leadCast.length - 1
                    if (!slug) return <span key={name}>{name}{isLast ? '' : ', '}</span>
                    return (
                      <span key={name}>
                        <button onClick={() => openActor(name)} className="text-white hover:text-primary">{name}</button>
                        {isLast ? '' : ', '}
                      </span>
                    )
                  })}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => toggleWatchlist(movie.id)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold transition hover:brightness-110"
                  >
                    <ListPlus size={16} />
                    {watchlist.includes(movie.id) ? 'Remove Watchlist' : 'Add to Watchlist'}
                  </button>
                  <a href={movie.trailerLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-primary">
                    <ExternalLink size={15} /> Watch Trailer
                  </a>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted">Your Rating</p>
                  <div className="flex items-center gap-3">
                    <StarRating current={ratings[movie.id] || 0} onRate={(value) => rateMovie(movie.id, value)} />
                    <span className="text-sm text-muted">{ratings[movie.id] || movie.rating}/10</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-lg font-semibold text-white">Because you watched {movie.title}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {getSmartRecs(movie.id).map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-white/10 bg-black/35 p-3">
                    <p className="font-semibold text-white">{rec.title}</p>
                    <p className="text-xs text-muted">{rec.year} • {rec.genre.join(' / ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default MovieModal
