import { useMemo, useState } from 'react'
import { Download, Trash2, Upload } from 'lucide-react'
import { useAuth, useMovies } from '../store'

const EMPTY_FORM = {
  title: '', genre: '', director: '', leadCast: '',
  rating: '8.0', year: '2024', synopsis: '',
  posterUrl: '', trailerLink: '', relatedPrequelSequelId: ''
}

function AdminDashboard() {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuth()
  const { movies, addMovie, deleteMovie, setLogoDataUrl, exportBackup, importBackup, stats } = useMovies()

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [formMessage, setFormMessage] = useState('')
  const [backupMessage, setBackupMessage] = useState('')

  const movieOptions = useMemo(
    () => movies.map((movie) => ({ id: movie.id, label: `${movie.title} (${movie.year})` })),
    [movies]
  )

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoDataUrl(typeof reader.result === 'string' ? reader.result : '')
    reader.readAsDataURL(file)
  }

  const handleAddMovie = (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      genre: form.genre.split(',').map((x) => x.trim()).filter(Boolean),
      leadCast: form.leadCast.split(',').map((x) => x.trim()).filter(Boolean)
    }
    const result = addMovie(payload)
    if (result.ok) { setFormMessage('Movie added successfully.'); setForm(EMPTY_FORM) }
    else setFormMessage(result.error)
  }

  const handleExportBackup = () => {
    const text = exportBackup()
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flixmate-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setBackupMessage('Backup exported.')
  }

  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const result = importBackup(text)
    setBackupMessage(result.ok ? 'Backup imported.' : result.error)
    event.target.value = ''
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 md:px-0">
        <div className="rounded-2xl border border-white/15 bg-surface/80 p-6">
          <h1 className="text-2xl font-bold text-white">FlixMate Admin Login</h1>
          <p className="mt-1 text-sm text-muted">Command Center access only.</p>
          <div className="mt-5 space-y-3">
            <input
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Username"
            />
            <input
              value={loginForm.password}
              type="password"
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Password"
            />
            {loginError && <p className="text-sm text-primary">{loginError}</p>}
            <button
              onClick={() => { const ok = loginAdmin(loginForm.username, loginForm.password); if (!ok) setLoginError('Invalid credentials') }}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold"
            >
              Enter Command Center
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-8 md:grid-cols-[1.1fr,1fr] md:px-8">
      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5">
        <h1 className="text-2xl font-bold text-white">Branding Manager</h1>
        <p className="mt-1 text-sm text-muted">Upload a logo to replace FLIXMATE text globally.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Movies', value: stats.movieCount },
            { label: 'Rated', value: stats.ratedCount },
            { label: 'Watchlist', value: stats.watchlistCount },
            { label: 'Avg Score', value: stats.avgRating }
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-muted">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary">
            <Upload size={16} /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
          <button onClick={handleExportBackup} className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary">
            <Download size={16} /> Export Backup
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary">
            <Upload size={16} /> Import Backup
            <input type="file" accept="application/json" className="hidden" onChange={handleImportBackup} />
          </label>
          <button onClick={logoutAdmin} className="rounded-md border border-white/15 px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-white">
            Logout
          </button>
        </div>
        {backupMessage && <p className="mt-2 text-sm text-muted">{backupMessage}</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5">
        <h2 className="text-2xl font-bold text-white">Add New Movie</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleAddMovie}>
          <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Title" />
          <input required value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Genres comma-separated" />
          <input required value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Director" />
          <input required value={form.leadCast} onChange={(e) => setForm((p) => ({ ...p, leadCast: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Lead cast comma-separated" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Rating" />
            <input required type="number" min="1900" max="2026" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Year" />
          </div>
          <textarea required value={form.synopsis} onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))} className="min-h-[90px] rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Synopsis" />
          <input required value={form.posterUrl} onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Poster URL" />
          <input required value={form.trailerLink} onChange={(e) => setForm((p) => ({ ...p, trailerLink: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Trailer link" />
          <select value={form.relatedPrequelSequelId} onChange={(e) => setForm((p) => ({ ...p, relatedPrequelSequelId: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm">
            <option value="">No related prequel/sequel</option>
            {movieOptions.map((movie) => (
              <option key={movie.id} value={movie.id}>{movie.label}</option>
            ))}
          </select>
          <button className="rounded-md bg-primary py-2 text-sm font-semibold">Add Movie</button>
          {formMessage && <p className="text-sm text-muted">{formMessage}</p>}
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5 md:col-span-2">
        <h2 className="mb-3 text-2xl font-bold text-white">Content Management</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {movies.slice(0, 50).map((movie) => (
            <div key={movie.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-white">{movie.title}</p>
                <p className="text-xs text-muted">{movie.year} • {movie.genre.join(' / ')}</p>
              </div>
              <button onClick={() => deleteMovie(movie.id)} className="rounded-md p-2 text-muted transition hover:bg-primary/20 hover:text-primary" aria-label={`Delete ${movie.title}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
