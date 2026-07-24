import { useState } from 'react'

/**
 * Cover art that removes itself when the source fails.
 *
 * Several catalogue poster URLs point at Wikimedia files that 404 or block
 * hotlinking. Without this the browser paints its broken-image glyph over the
 * card; on failure the parent's hue gradient shows through instead.
 */
export default function PosterImage({ src, alt = '', opacity = 1, objectPosition, style }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition,
        opacity,
        ...style
      }}
    />
  )
}
