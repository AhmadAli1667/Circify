import { Search, Shield, X } from 'lucide-react'
import { useMovies } from '../store'

function Navbar({ onOpenAdmin, onOpenHome }) {
  const { logoDataUrl, searchQuery, setSearchQuery } = useMovies()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        <button
          onClick={onOpenHome}
          className="flex items-center gap-3 rounded-md p-1 text-left transition hover:bg-white/5"
          title="Go to Home"
        >
          {logoDataUrl ? (
            <img src={logoDataUrl} alt="FlixMate" className="h-10 w-auto rounded-md object-contain" />
          ) : (
            <div className="text-2xl font-black tracking-wide text-primary">FLIXMATE</div>
          )}
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-muted md:inline">
            Movie Discovery Engine
          </span>
        </button>

        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-surface/70 px-3 py-2 transition focus-within:border-primary/60 focus-within:shadow-[0_0_0_2px_rgba(255,107,53,0.2)]">
          <Search size={18} className="text-muted" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') setSearchQuery('') }}
            placeholder="Search title, director, cast, genre..."
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-md p-1 text-muted transition hover:bg-white/10 hover:text-white"
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenAdmin}
          className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-primary/70 hover:text-text md:flex"
        >
          <Shield size={16} />
          Command Center
        </button>
      </div>
    </header>
  )
}

export default Navbar
