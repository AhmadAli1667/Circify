import { useEffect, useMemo, useState } from 'react'
// Imports React hooks:
// useEffect — synchronizes the image src when the prop changes
// useMemo — memoizes the resolved fallback to avoid recalculating on every render
// useState — tracks the current src being displayed and whether the fallback was already tried

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='
// A 1×1 transparent GIF encoded as a data URL
// Used as the last-resort fallback when both the real src and fallbackSrc fail to load
// Avoids broken image icons (the ugly browser default for failed images)

function SafeImage({ src, fallbackSrc = TRANSPARENT_PIXEL, alt, className = '' }) {
  // A wrapper around <img> that silently handles broken image URLs
  // src: the intended image URL (may fail)
  // fallbackSrc: the backup image URL (defaults to transparent pixel)
  // alt: accessibility text describing the image
  // className: Tailwind/CSS classes forwarded to the <img> element

  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)
  // currentSrc: the URL currently being rendered in the <img>
  // Initializes to src if available, otherwise immediately uses fallbackSrc

  const [triedFallback, setTriedFallback] = useState(false)
  // Tracks whether we already attempted the fallbackSrc
  // Prevents infinite loop: if fallbackSrc also fails, we stop and use TRANSPARENT_PIXEL

  const resolvedFallback = useMemo(() => fallbackSrc || TRANSPARENT_PIXEL, [fallbackSrc])
  // Memoizes the effective fallback — if fallbackSrc is an empty string or undefined, use the transparent pixel
  // useMemo means this only recalculates when fallbackSrc prop changes

  useEffect(() => {
    // Runs whenever src or resolvedFallback changes (e.g. parent swaps the movie poster)

    setCurrentSrc(src || resolvedFallback)
    // Resets displayed src to the new prop value; falls back if src is empty/null

    setTriedFallback(false)
    // Resets the fallback-tried flag so the new src gets a fresh fallback attempt if it fails
  }, [src, resolvedFallback])
  // Dependency array: only re-runs when these two values change

  const handleError = () => {
    // Called by the browser when the current image URL fails to load (404, CORS, etc.)

    if (!triedFallback) {
      // First failure: we haven't tried the fallback yet

      setCurrentSrc(resolvedFallback)
      // Switch to the fallback image URL

      setTriedFallback(true)
      // Mark that we've tried the fallback — prevents looping if fallback also fails

      return
      // Exit early; if fallbackSrc also fails, handleError will be called again
    }
    setCurrentSrc(TRANSPARENT_PIXEL)
    // Both src and fallbackSrc failed — use the transparent pixel to hide the broken icon silently
  }

  return <img src={currentSrc} alt={alt} className={className} onError={handleError} />
  // Renders a standard <img> element with:
  // src: current resolved URL (original, fallback, or transparent pixel)
  // alt: accessibility description text
  // className: forwarded CSS/Tailwind classes
  // onError: triggers the fallback chain when the image fails to load
}

export default SafeImage
// Makes SafeImage available for import in other files
