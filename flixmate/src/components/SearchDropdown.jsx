import { useEffect, useRef, useState } from 'react'
import { pill } from '../app/ui'
import { SearchIcon } from './primitives'

/**
 * Single-select combobox: a closed trigger showing the current pick, which
 * opens into a search box + filtered option list. Renders inline (no
 * portal/absolute popover) so it never gets clipped by the scrollable wizard
 * rail/bottom-sheet it lives inside.
 */
export default function SearchDropdown({ options, value, onChange, placeholder = 'Search…' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 13px',
          border: `1px solid ${open ? 'var(--fm-accent)' : 'var(--fm-border)'}`,
          background: 'var(--fm-input)',
          borderRadius: 12,
          color: 'var(--fm-text)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'border-color .2s'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          style={{
            color: 'var(--fm-muted)',
            fontSize: 10,
            flex: 'none',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s'
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 6,
            border: '1px solid var(--fm-border)',
            background: 'var(--fm-surface)',
            borderRadius: 12,
            padding: 8,
            boxShadow: '0 14px 34px rgba(0,0,0,.32)',
            animation: 'fmPop .16s ease'
          }}
        >
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <div
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--fm-muted)',
                display: 'flex',
                pointerEvents: 'none'
              }}
            >
              <SearchIcon size={13} />
            </div>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                border: '1px solid var(--fm-border)',
                background: 'var(--fm-input)',
                borderRadius: 9,
                color: 'var(--fm-text)',
                fontSize: 12.5,
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          <div
            className="fm-scroll"
            style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {filtered.length ? (
              filtered.map((o) => {
                const active = o.value === value
                return (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                      setQuery('')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      textAlign: 'left',
                      padding: '8px 10px',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                      ...pill(active)
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.label}
                    </span>
                    {o.hint}
                  </button>
                )
              })
            ) : (
              <div style={{ padding: '10px 8px', color: 'var(--fm-muted)', fontSize: 12.5, fontWeight: 600 }}>
                No matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
