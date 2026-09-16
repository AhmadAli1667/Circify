import { useState } from 'react'

/**
 * Cover art that removes itself when the source fails, and shows a shimmer
 * skeleton in its place while the image is still fetching.
 *
 * Several catalogue poster URLs point at Wikimedia files that 404 or block
 * hotlinking. Without this the browser paints its broken-image glyph over the
 * card; on failure the parent's hue gradient shows through instead.
 */
export default function PosterImage({ src, alt = '', opacity = 1, objectPosition, style }) {
  const [status, setStatus] = useState('loading')
  const [trackedSrc, setTrackedSrc] = useState(src)

  // `src` can change without the component remounting (e.g. the modal's
  // "more like this" strip swaps posters in place), so reset the loading
  // state during render rather than in an effect.
  if (src !== trackedSrc) {
    setTrackedSrc(src)
    setStatus('loading')
  }

  if (!src || status === 'failed') return null

  return (
    <>
      {status === 'loading' && <div className="fm-skeleton" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          opacity: status === 'loaded' ? opacity : 0,
          transition: 'opacity .35s ease',
          ...style
        }}
      />
    </>
  )
}
