const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A review body with any mention of a cast member's full name turned into a
 * link to that person's actor page, the way IMDb's message boards cross-link
 * names. Longest names matched first so "Chris Evans" wins over a bare
 * "Chris" from a shorter castmate.
 */
export default function LinkedReviewText({ text, cast, onOpenActor, style }) {
  const names = (cast || []).map((c) => c.name).filter(Boolean)
  if (!names.length || !text) return <span style={style}>{text}</span>

  const pattern = new RegExp(`(${[...names].sort((a, b) => b.length - a.length).map(escapeRe).join('|')})`, 'g')
  const parts = text.split(pattern)

  return (
    <span style={style}>
      {parts.map((part, i) => {
        const person = cast.find((c) => c.name === part)
        if (!person) return <span key={i}>{part}</span>
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation()
              onOpenActor(person.id)
            }}
            style={{
              display: 'inline',
              padding: 0,
              border: 'none',
              background: 'none',
              font: 'inherit',
              color: 'var(--fm-accent)',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {part}
          </button>
        )
      })}
    </span>
  )
}
