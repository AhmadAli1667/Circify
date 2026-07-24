/**
 * Generated poster / backdrop art.
 *
 * The catalogue only carries real poster images for the ~43 hand-curated
 * titles; the rest fall back to these hue-driven gradients, which is exactly
 * how every card in the mockup was rendered. Backdrops are always generated
 * because no title in the catalogue ships a wide still.
 */

/** Portrait poster fill for a given hue (0–359). */
export const grad = (h) =>
  `radial-gradient(80% 62% at 74% 14%, hsl(${h} 62% 48%) 0%, transparent 56%), ` +
  `linear-gradient(158deg, hsl(${h} 54% 30%), hsl(${(h + 34) % 360} 60% 11%))`

/** Wide cinematic backdrop fill for a given hue. */
export const backdrop = (h) =>
  `radial-gradient(115% 130% at 82% 22%, hsl(${h} 60% 44%) 0%, hsl(${h} 55% 24%) 32%, transparent 66%), ` +
  `radial-gradient(90% 120% at 96% 92%, hsl(${(h + 30) % 360} 56% 30%), transparent 58%), #060608`

/**
 * Stable hue from a string, so a title always paints the same colour across
 * reloads and across every surface it appears on.
 */
export function hueFor(str) {
  let h = 0
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) % 360
  }
  return h
}

/** Two-letter monogram used on avatars and cast circles. */
export function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
