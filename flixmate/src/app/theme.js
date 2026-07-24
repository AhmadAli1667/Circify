/**
 * Theme presets, ported 1:1 from the Flixmate UI mockup.
 *
 * Each preset carries a dark accent pair (da/da2), a light accent pair
 * (la/la2), and two eight-slot ramps in the fixed order:
 *   [bg, surface, elev, border, hover, text, muted, scroll]
 */

export const PRESETS = {
  midnight: {
    da: '#FF5B52', da2: '#FF7068', la: '#E8483F', la2: '#D63C34',
    dark: ['#09090B', '#111114', '#18181D', '#27272D', '#1d1d22', '#F5F5F5', '#A1A1AA', '#33333d'],
    light: ['#F4F3F1', '#FFFFFF', '#FFFFFF', '#E6E3DF', '#EEEBE7', '#141416', '#6C6C74', '#d6d2cc']
  },
  coral: {
    da: '#FF5B4C', da2: '#FF7A6D', la: '#E64632', la2: '#D13c2a',
    dark: ['#0d0a0b', '#161113', '#1d1619', '#2c2226', '#221a1d', '#F6F3F4', '#A99EA2', '#3a2d31'],
    light: ['#F8F3F1', '#FFFFFF', '#FFFFFF', '#EBE0DC', '#F0E7E3', '#191316', '#7A6F72', '#ddd0cb']
  },
  abyss: {
    da: '#2CC9E4', da2: '#57D8EF', la: '#0E97B4', la2: '#0b7f98',
    dark: ['#050a0e', '#0b131a', '#111c25', '#1e2c37', '#132029', '#EEF4F7', '#8EA3B0', '#22323d'],
    light: ['#EEF3F6', '#FFFFFF', '#FFFFFF', '#D8E4EA', '#E3EDF2', '#0D1519', '#5F727D', '#c6d5dd']
  },
  verdant: {
    da: '#34E39B', da2: '#57ECAD', la: '#12A56C', la2: '#0e8c5b',
    dark: ['#060b08', '#0c1410', '#121c16', '#1f2c24', '#131f18', '#EEF5F0', '#93A89B', '#22342a'],
    light: ['#EFF4F0', '#FFFFFF', '#FFFFFF', '#DBE7E0', '#E5EFE8', '#0C1611', '#61756A', '#c9dacf']
  },
  golden: {
    da: '#E8A22B', da2: '#F5C451', la: '#B57A0E', la2: '#9c6a0b',
    dark: ['#08080a', '#131210', '#1b1915', '#2d281d', '#221f17', '#F6F1E6', '#A69E88', '#38322a'],
    light: ['#F7F2E6', '#FFFFFF', '#FFFFFF', '#EADFC6', '#F1EAD6', '#1a1610', '#7a7256', '#dccdaa']
  },
  amethyst: {
    da: '#A981F5', da2: '#C0A3FF', la: '#7C3AED', la2: '#6d28d9',
    dark: ['#0a0910', '#141118', '#1b1723', '#2c2637', '#221d2c', '#F3F0F8', '#A29BB0', '#332c42'],
    light: ['#F4F1F8', '#FFFFFF', '#FFFFFF', '#E5DEEF', '#EDE7F4', '#161320', '#6E6780', '#d3c9e4']
  },
  marine: {
    da: '#33D9A6', da2: '#5BE8BC', la: '#0F9E76', la2: '#0c8a66',
    dark: ['#06111c', '#0b1a28', '#102434', '#1d3345', '#132636', '#EAF4F2', '#89A6AC', '#1f3a44'],
    light: ['#EEF4F3', '#FFFFFF', '#FFFFFF', '#D6E6E2', '#E2EEEB', '#0B1720', '#5E7378', '#c4dad4']
  }
}

/** Swatch order for the avatar-menu theme picker. */
export const PRESET_LIST = [
  ['midnight', 'Midnight', '#FF5B52'],
  ['coral', 'Coral', '#FF5B4C'],
  ['golden', 'Golden', '#E8A22B'],
  ['amethyst', 'Amethyst', '#A981F5'],
  ['abyss', 'Abyss', '#2CC9E4'],
  ['verdant', 'Verdant', '#34E39B'],
  ['marine', 'Marine', '#2BC79E']
]

/** Resolve a preset + mode into the full --fm-* custom property map. */
export function themeVars(preset, mode) {
  const p = PRESETS[preset] || PRESETS.midnight
  const dark = mode === 'dark'
  const [bg, surface, elev, border, hover, text, muted, scroll] = dark ? p.dark : p.light
  const acc = dark ? p.da : p.la
  const acc2 = dark ? p.da2 : p.la2

  return {
    '--fm-bg': bg,
    '--fm-surface': surface,
    '--fm-elev': elev,
    '--fm-border': border,
    '--fm-hover': hover,
    '--fm-text': text,
    '--fm-muted': muted,
    '--fm-scroll': scroll,
    '--fm-accent': acc,
    '--fm-accent2': acc2,
    '--fm-accentsoft': `color-mix(in srgb, ${acc} 15%, transparent)`,
    '--fm-accentglow': `color-mix(in srgb, ${acc} 40%, transparent)`,
    '--fm-input': dark ? elev : hover,
    '--fm-navbg': `color-mix(in srgb, ${bg} 82%, transparent)`
  }
}

/**
 * Write the theme onto <html>. Using the root element (rather than a wrapper
 * div, as the mockup did) means fixed-position overlays inherit the vars too.
 */
export function applyTheme(preset, mode) {
  const root = document.documentElement
  const vars = themeVars(preset, mode)
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  root.style.colorScheme = mode === 'dark' ? 'dark' : 'light'
}
