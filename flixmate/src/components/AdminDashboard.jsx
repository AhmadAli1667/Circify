import { useMemo, useState } from 'react'
// useMemo — memoizes the movie options list so it only recalculates when movies array changes
// useState — manages local form state, login form, and status messages

import { Download, Trash2, Upload } from 'lucide-react'
// Download — icon for the Export Backup button
// Trash2 — trash can icon for the Delete movie button
// Upload — icon used for both Upload Logo and Import Backup buttons

import { useAuth, useMovies } from '../store'
// useAuth — provides isAdmin, loginAdmin, logoutAdmin
// useMovies — provides movies list, crud functions, backup tools, and stats

const EMPTY_FORM = {
  // The default state for the Add Movie form — all fields blank/default
  title: '',
  // Movie title text
  genre: '',
  // Genre string — user types comma-separated values like "Action, Drama"
  director: '',
  // Director's name
  leadCast: '',
  // Cast string — user types comma-separated names
  rating: '8.0',
  // Default rating pre-filled to 8.0 (a good default to suggest quality)
  year: '2024',
  // Default year pre-filled to current year
  synopsis: '',
  // Plot summary text
  posterUrl: '',
  // URL for the movie poster image
  trailerLink: '',
  // URL for the trailer (YouTube link etc.)
  relatedPrequelSequelId: ''
  // ID of a related prequel/sequel movie — empty string means no relation
}

function AdminDashboard() {
  // The admin control panel — only accessible after login with hardcoded credentials

  const { isAdmin, loginAdmin, logoutAdmin } = useAuth()
  // isAdmin: boolean — gates access to the dashboard
  // loginAdmin(user, pass): validates credentials and sets isAdmin to true
  // logoutAdmin(): clears admin session

  const { movies, addMovie, deleteMovie, setLogoDataUrl, exportBackup, importBackup, stats } = useMovies()
  // movies: full array of all movie objects
  // addMovie(payload): validates and adds a new movie to the context
  // deleteMovie(id): removes a movie by ID from movies, watchlist, and ratings
  // setLogoDataUrl(dataUrl): updates the custom logo shown in the Navbar
  // exportBackup(): serializes all state to a JSON string for download
  // importBackup(text): parses a JSON backup and restores all state
  // stats: { movieCount, ratedCount, watchlistCount, avgRating }

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  // Controlled form state for the admin login screen (username + password inputs)

  const [loginError, setLoginError] = useState('')
  // Error message shown below the login form when credentials are wrong

  const [form, setForm] = useState(EMPTY_FORM)
  // Controlled form state for the Add New Movie form — resets to EMPTY_FORM after success

  const [formMessage, setFormMessage] = useState('')
  // Feedback message shown after the Add Movie form is submitted (success or validation error)

  const [backupMessage, setBackupMessage] = useState('')
  // Feedback message shown after export or import backup operations

  const movieOptions = useMemo(
    () => movies.map((movie) => ({ id: movie.id, label: `${movie.title} (${movie.year})` })),
    // Transforms the full movies array into minimal { id, label } objects for the dropdown
    [movies]
    // Recalculates only when the movies array changes
  )

  const handleLogoUpload = (event) => {
    // Handles the logo file input change — converts image to base64 data URL

    const file = event.target.files?.[0]
    // Gets the first selected file; optional chaining prevents error if no file is selected

    if (!file) {
      // If no file was selected, exit without doing anything
      return
    }
    const reader = new FileReader()
    // FileReader: browser API that reads file data asynchronously

    reader.onload = () => {
      // Called when the file has been fully read

      setLogoDataUrl(typeof reader.result === 'string' ? reader.result : '')
      // Saves the base64 data URL to MovieContext which stores it in localStorage and shows it in Navbar
      // Type check guards against unexpected non-string FileReader results
    }
    reader.readAsDataURL(file)
    // Starts reading the image file and encoding it as a data URL
  }

  const handleAddMovie = (event) => {
    // Handles the Add Movie form submission

    event.preventDefault()
    // Prevents the browser from doing a real form POST/GET request

    const payload = {
      ...form,
      // Spreads all form fields into the payload object

      genre: form.genre
        .split(',')
        // Splits the comma-separated genre string into an array
        .map((x) => x.trim())
        // Removes leading/trailing whitespace from each genre
        .filter(Boolean),
        // Removes any empty strings caused by trailing commas

      leadCast: form.leadCast
        .split(',')
        // Splits the comma-separated cast string into an array
        .map((x) => x.trim())
        // Trims whitespace from each name
        .filter(Boolean)
        // Removes empty strings
    }

    const result = addMovie(payload)
    // Calls MovieContext's addMovie with the prepared payload
    // Returns { ok: true } on success or { ok: false, error: string } on validation failure

    if (result.ok) {
      // Movie was added successfully

      setFormMessage('Movie added successfully.')
      // Shows a success message below the form

      setForm(EMPTY_FORM)
      // Resets all form fields back to their defaults
    } else {
      setFormMessage(result.error)
      // Shows the validation error message (e.g. "Poster URL must start with http://")
    }
  }

  const handleExportBackup = () => {
    // Creates and downloads a JSON backup file of all app data

    const text = exportBackup()
    // Gets the full JSON string from MovieContext (movies, ratings, watchlist, logo)

    const blob = new Blob([text], { type: 'application/json' })
    // Wraps the string in a Blob object — a browser representation of raw file data

    const url = URL.createObjectURL(blob)
    // Creates a temporary download URL pointing to the Blob data

    const a = document.createElement('a')
    // Creates a temporary invisible <a> element to trigger the download

    a.href = url
    // Points the link to the Blob URL

    a.download = `flixmate-backup-${Date.now()}.json`
    // Sets the filename — timestamp ensures each backup has a unique name

    a.click()
    // Programmatically clicks the link to trigger the browser download dialog

    URL.revokeObjectURL(url)
    // Frees the Blob URL from memory — important to prevent memory leaks

    setBackupMessage('Backup exported.')
    // Shows a confirmation message to the admin
  }

  const handleImportBackup = async (event) => {
    // Handles importing a backup JSON file — async because reading the file is asynchronous

    const file = event.target.files?.[0]
    // Gets the selected JSON file

    if (!file) {
      // If no file was selected, exit early
      return
    }

    const text = await file.text()
    // Reads the file contents as a plain text string (async — waits for the read to complete)

    const result = importBackup(text)
    // Passes the raw JSON text to MovieContext's importBackup for parsing and validation

    setBackupMessage(result.ok ? 'Backup imported.' : result.error)
    // Shows success message or the specific error if the JSON is invalid/malformed

    event.target.value = ''
    // Resets the file input so the same file can be re-imported if needed (browsers cache the value)
  }

  if (!isAdmin) {
    // If not logged in as admin, show only the login form

    return (
      <main className="mx-auto max-w-md px-4 py-10 md:px-0">
        {/* Narrow centered container for the login card */}

        <div className="rounded-2xl border border-white/15 bg-surface/80 p-6">
          {/* Card: rounded, subtle border, dark surface background */}

          <h1 className="text-2xl font-bold text-white">FlixMate Admin Login</h1>
          {/* Login card title */}

          <p className="mt-1 text-sm text-muted">Command Center access only.</p>
          {/* Subtitle clarifying this is restricted access */}

          <div className="mt-5 space-y-3">
            {/* Vertical stack of form fields with spacing */}

            <input
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              // Updates only the username field in loginForm state
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Username"
            />
            <input
              value={loginForm.password}
              type="password"
              // Masks the input characters for security
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              // Updates only the password field in loginForm state
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="Password"
            />
            {loginError && <p className="text-sm text-primary">{loginError}</p>}
            {/* Shows the error message in Netflix-red if credentials were wrong */}

            <button
              onClick={() => {
                // Validates credentials when the button is clicked

                const ok = loginAdmin(loginForm.username, loginForm.password)
                // Calls the auth context login function; returns true/false

                if (!ok) {
                  setLoginError('Invalid credentials')
                  // Shows an error if login failed
                }
              }}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold"
              // Full-width Netflix-red login button
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
      {/* Two-column grid layout on medium screens — left column slightly wider */}

      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5">
        {/* Branding Manager card — top-left */}

        <h1 className="text-2xl font-bold text-white">Branding Manager</h1>
        <p className="mt-1 text-sm text-muted">Upload a logo to replace FLIXMATE text globally.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Stats grid: 2 columns on mobile, 4 on medium+ */}

          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-muted">Movies</p>
            <p className="text-xl font-bold text-white">{stats.movieCount}</p>
            {/* Total number of movies currently in the database */}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-muted">Rated</p>
            <p className="text-xl font-bold text-white">{stats.ratedCount}</p>
            {/* Number of movies the user has personally rated */}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-muted">Watchlist</p>
            <p className="text-xl font-bold text-white">{stats.watchlistCount}</p>
            {/* Number of movies currently in the user's watchlist */}
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-muted">Avg Score</p>
            <p className="text-xl font-bold text-white">{stats.avgRating}</p>
            {/* Average effective rating across all movies (2 decimal places) */}
          </div>
        </div>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary">
          {/* Styled label as a button — clicking it triggers the hidden file input */}
          <Upload size={16} />
          {/* Upload icon */}
          Upload Logo
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          {/* Hidden file input — clicking the label triggers it; accepts only image files */}
        </label>

        <button
          onClick={handleExportBackup}
          // Triggers the backup download when clicked
          className="ml-3 inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary"
        >
          <Download size={16} />
          {/* Download icon */}
          Export Backup
        </button>

        <label className="ml-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white transition hover:border-primary">
          {/* Styled label as button for the import file input */}
          <Upload size={16} />
          Import Backup
          <input type="file" accept="application/json" className="hidden" onChange={handleImportBackup} />
          {/* Hidden file input restricted to JSON files */}
        </label>

        {backupMessage && <p className="mt-2 text-sm text-muted">{backupMessage}</p>}
        {/* Shows export/import result message below the buttons */}

        <button
          onClick={logoutAdmin}
          // Calls auth context logout and returns to the login screen
          className="ml-3 rounded-md border border-white/15 px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-white"
        >
          Logout
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5">
        {/* Add New Movie card — top-right */}

        <h2 className="text-2xl font-bold text-white">Add New Movie</h2>
        <form className="mt-4 grid gap-3" onSubmit={handleAddMovie}>
          {/* Form submits to handleAddMovie; gap-3 gives consistent vertical spacing between fields */}

          <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Title" />
          {/* required: prevents submission if empty; updates only the title field in form state */}

          <input required value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Genres comma-separated" />
          {/* Genres as a comma-separated string; split into array in handleAddMovie before submission */}

          <input required value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Director" />
          {/* Director name field */}

          <input required value={form.leadCast} onChange={(e) => setForm((p) => ({ ...p, leadCast: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Lead cast comma-separated" />
          {/* Cast as a comma-separated string; split into array in handleAddMovie */}

          <div className="grid grid-cols-2 gap-3">
            {/* Side-by-side Rating and Year fields */}

            <input required type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Rating" />
            {/* Number input with 0.1 step for decimal ratings; clamped 0–10 */}

            <input required type="number" min="1900" max="2026" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Year" />
            {/* Year must be between 1900 and 2026 */}
          </div>

          <textarea required value={form.synopsis} onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))} className="min-h-[90px] rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Synopsis" />
          {/* Multi-line text area with minimum height for the plot summary */}

          <input required value={form.posterUrl} onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Poster URL" />
          {/* Must be a valid http/https URL — validated in addMovie() in MovieContext */}

          <input required value={form.trailerLink} onChange={(e) => setForm((p) => ({ ...p, trailerLink: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" placeholder="Trailer link" />
          {/* Must be a valid http/https URL — validated in addMovie() in MovieContext */}

          <select value={form.relatedPrequelSequelId} onChange={(e) => setForm((p) => ({ ...p, relatedPrequelSequelId: e.target.value }))} className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm">
            {/* Dropdown to link this movie to a related prequel or sequel */}
            <option value="">No related prequel/sequel</option>
            {/* Default option — null relation */}
            {movieOptions.map((movie) => (
              // Renders one option per existing movie
              <option key={movie.id} value={movie.id}>
                {movie.label}
                {/* e.g. "The Dark Knight (2008)" */}
              </option>
            ))}
          </select>

          <button className="rounded-md bg-primary py-2 text-sm font-semibold">Add Movie</button>
          {/* Submit button — Netflix-red; triggers onSubmit which calls handleAddMovie */}

          {formMessage && <p className="text-sm text-muted">{formMessage}</p>}
          {/* Shows success or validation error message below the button after form submission */}
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/75 p-5 md:col-span-2">
        {/* Content Management section — spans both columns on medium screens */}

        <h2 className="mb-3 text-2xl font-bold text-white">Content Management</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {/* Two-column grid of movie rows — 1 column on mobile, 2 on medium+ */}

          {movies.slice(0, 50).map((movie) => (
            // Shows only the first 50 movies — prevents the section from becoming too long
            <div key={movie.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              {/* Row for each movie: info on the left, delete button on the right */}

              <div>
                <p className="text-sm font-semibold text-white">{movie.title}</p>
                {/* Movie title */}
                <p className="text-xs text-muted">{movie.year} • {movie.genre.join(' / ')}</p>
                {/* Year and genre tags separated by bullet */}
              </div>
              <button onClick={() => deleteMovie(movie.id)} className="rounded-md p-2 text-muted transition hover:bg-primary/20 hover:text-primary" aria-label={`Delete ${movie.title}`}>
                {/* Delete button — removes movie from state and localStorage immediately */}
                {/* aria-label provides accessible name for screen readers */}
                <Trash2 size={16} />
                {/* Trash can icon — 16px */}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard
// Makes AdminDashboard available for import in App.jsx
