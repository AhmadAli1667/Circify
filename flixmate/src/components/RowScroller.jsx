import { useRef, useState } from 'react'
import { useHover } from '../app/ui'

/**
 * Horizontally-scrolling row wrapper: no visible scrollbar, hover-revealed
 * prev/next arrows that page by ~85% of the visible width. Netflix-style
 * row navigation instead of leaving it to raw trackpad/drag scroll.
 */
export default function RowScroller({ children, gap = 16, onNearEnd }) {
  const trackRef = useRef(null)
  const [hoverRow, bindRow] = useHover()
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = () => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    if (onNearEnd && el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth) onNearEnd()
  }

  const page = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div {...bindRow} style={{ position: 'relative' }}>
      <div
        ref={trackRef}
        className="fm-scroll fm-noscrollbar"
        onScroll={updateEdges}
        style={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          padding: '4px 2px 16px',
          scrollSnapType: 'x proximity'
        }}
      >
        {children}
      </div>

      {hoverRow && !atStart && <RowArrow dir="left" onClick={() => page(-1)} />}
      {hoverRow && !atEnd && <RowArrow dir="right" onClick={() => page(1)} />}
    </div>
  )
}

function RowArrow({ dir, onClick }) {
  const [hov, bind] = useHover()
  return (
    <button
      {...bind}
      onClick={onClick}
      aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 16,
        [dir === 'left' ? 'left' : 'right']: 0,
        width: 46,
        border: 'none',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background:
          dir === 'left'
            ? 'linear-gradient(90deg,var(--fm-bg) 20%,transparent)'
            : 'linear-gradient(270deg,var(--fm-bg) 20%,transparent)',
        opacity: hov ? 1 : 0.85,
        transition: 'opacity .2s',
        zIndex: 2
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
        {dir === 'left' ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  )
}
