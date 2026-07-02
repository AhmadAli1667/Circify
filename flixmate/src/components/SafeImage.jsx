import { useEffect, useMemo, useState } from 'react'

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

function SafeImage({ src, fallbackSrc = TRANSPARENT_PIXEL, alt, className = '' }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)
  const [triedFallback, setTriedFallback] = useState(false)

  const resolvedFallback = useMemo(() => fallbackSrc || TRANSPARENT_PIXEL, [fallbackSrc])

  useEffect(() => {
    setCurrentSrc(src || resolvedFallback)
    setTriedFallback(false)
  }, [src, resolvedFallback])

  const handleError = () => {
    if (!triedFallback) {
      setCurrentSrc(resolvedFallback)
      setTriedFallback(true)
      return
    }
    setCurrentSrc(TRANSPARENT_PIXEL)
  }

  return <img src={currentSrc} alt={alt} className={className} onError={handleError} />
}

export default SafeImage
