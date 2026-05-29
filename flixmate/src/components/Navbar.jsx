import { Search, Shield, X } from 'lucide-react'
// Imports icons from Lucide React:
// Search — magnifying glass icon for the search input
// Shield — security/admin icon for the Command Center button
// X — close/clear icon that appears when the search box has text

import { useMovies } from '../store'
// Imports the useMovies hook to read and update the global search query and logo

function Navbar({ onOpenAdmin, onOpenHome }) {
  // The sticky top navigation bar component
  // onOpenAdmin: callback function passed from App.jsx — navigates to #/admin when called
  // onOpenHome: callback function passed from App.jsx — navigates to #/ when called

  const { logoDataUrl, searchQuery, setSearchQuery } = useMovies()
  // logoDataUrl: base64 data URL of the custom logo uploaded by admin; empty string if no logo
  // searchQuery: the current value of the search input (shared across the whole app)
  // setSearchQuery: function to update the global search query from MovieContext

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      {/* sticky top-0: navbar stays fixed at the top of the viewport while scrolling */}
      {/* z-40: ensures the navbar sits above most content but below modals (z-50) */}
      {/* border-b border-white/10: subtle bottom border at 10% white opacity */}
      {/* bg-black/60: semi-transparent black background */}
      {/* backdrop-blur-xl: frosted-glass blur effect on content scrolling behind the navbar */}

      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
        {/* Centers content, limits max width to 1400px, distributes items with space-between */}

        <button
          onClick={onOpenHome}
          // Navigates back to the home page when the logo area is clicked
          className="flex items-center gap-3 rounded-md p-1 text-left transition hover:bg-white/5"
          // Horizontal layout, small gap, subtle hover background, smooth transition
          title="Go to Home"
          // Tooltip shown on hover
        >
          {logoDataUrl ? (
            // If admin uploaded a custom logo, show it as an image
            <img src={logoDataUrl} alt="FlixMate" className="h-10 w-auto rounded-md object-contain" />
            // h-10: 40px tall; w-auto: preserves aspect ratio; object-contain: no cropping
          ) : (
            // Otherwise show the text fallback logo
            <div className="text-2xl font-black tracking-wide text-primary">FLIXMATE</div>
            // Large bold Netflix-red text logo
          )}
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-muted md:inline">
            {/* Badge only visible on medium screens and above (md:inline) */}
            Movie Discovery Engine
          </span>
        </button>

        <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-white/10 bg-surface/70 px-3 py-2 transition focus-within:border-primary/60 focus-within:shadow-[0_0_0_2px_rgba(255,107,53,0.2)]">
          {/* Search bar container: full width up to 576px, rounded, dark semi-transparent background */}
          {/* focus-within: highlights the border in Netflix-red when the input is focused */}

          <Search size={18} className="text-muted" />
          {/* Search icon — grey, 18px, left side of the input */}

          <input
            value={searchQuery}
            // Controlled input — value comes from global MovieContext state

            onChange={(event) => setSearchQuery(event.target.value)}
            // On every keystroke, updates the global search query which filters movies in real-time

            onKeyDown={(event) => {
              // Keyboard shortcut: pressing Escape clears the search input
              if (event.key === 'Escape') {
                setSearchQuery('')
                // Resets the global search query to empty, restoring the full movie list
              }
            }}
            placeholder="Search title, director, cast, genre..."
            // Hint text visible when input is empty
            className="w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
            // Full width, transparent bg to match container, small text, muted placeholder, no focus ring
          />
          {searchQuery && (
            // Only renders the X button when there is text in the search box

            <button
              onClick={() => setSearchQuery('')}
              // Clears the search query when clicked
              className="rounded-md p-1 text-muted transition hover:bg-white/10 hover:text-white"
              // Small icon button with subtle hover effect
              title="Clear search"
              aria-label="Clear search"
              // Accessibility: screen readers announce this button as "Clear search"
            >
              <X size={14} />
              {/* Small X icon — 14px */}
            </button>
          )}
        </div>

        <button
          onClick={onOpenAdmin}
          // Navigates to the admin dashboard when clicked
          className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-primary/70 hover:text-text md:flex"
          // hidden: invisible on mobile; md:flex: shows as flex row only on medium screens and up
          // Hover: border turns Netflix-red tint, text goes from grey to white
        >
          <Shield size={16} />
          {/* Shield icon representing admin/security access */}
          Command Center
          {/* Label for the admin navigation button */}
        </button>
      </div>
    </header>
  )
}

export default Navbar
// Makes Navbar available for import in other files
