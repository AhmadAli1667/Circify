/**
 * Theme presets, ported 1:1 from the Flixmate UI mockup.
 *
 * Each preset carries a dark accent pair (da/da2), a light accent pair
 * (la/la2), and two eight-slot ramps in the fixed order:
 *   [bg, surface, elev, border, hover, text, muted, scroll]
 */

export const PRESETS = {
  // Warm theatre-black instead of a neutral graphite: every dark ramp below
  // is tinted a few degrees toward its own accent hue rather than sitting on
  // flat gray, so the whole app reads as one velvet-and-marquee-neon family
  // instead of a generic dark-mode default with a colour swapped in.
  midnight: {
    da: '#FF5B52', da2: '#FF7068', la: '#E8483F', la2: '#D63C34',
    dark: ['#0B0908', '#151110', '#1D1815', '#2E2621', '#221B17', '#F7F1EA', '#A99A8C', '#3D2F27'],
    light: ['#F6F0E7', '#FFFFFF', '#FFFFFF', '#E7DDCE', '#F1E8DA', '#17110D', '#6E6155', '#D8C9B4']
  },
  coral: {
    da: '#FF5B4C', da2: '#FF7A6D', la: '#E64632', la2: '#D13c2a',
    dark: ['#100907', '#1B1210', '#241814', '#362621', '#281915', '#F8F0EC', '#B39A91', '#45302A'],
    light: ['#FAF1EC', '#FFFFFF', '#FFFFFF', '#EEDCD3', '#F5E7DF', '#1C110D', '#7C685F', '#E0C7BA']
  },
  abyss: {
    da: '#2CC9E4', da2: '#57D8EF', la: '#0E97B4', la2: '#0b7f98',
    dark: ['#050B0F', '#0C151C', '#131F27', '#21323D', '#16232C', '#EEF6F9', '#8FA6B2', '#26404C'],
    light: ['#EEF4F7', '#FFFFFF', '#FFFFFF', '#D5E3EA', '#E4EFF3', '#0B171C', '#5C7078', '#C2D6DE']
  },
  verdant: {
    da: '#34E39B', da2: '#57ECAD', la: '#12A56C', la2: '#0e8c5b',
    dark: ['#060B08', '#0D1611', '#142019', '#22322A', '#16221B', '#EFF6F1', '#92AA9C', '#253A2E'],
    light: ['#EFF5F0', '#FFFFFF', '#FFFFFF', '#D9E7DE', '#E5F0E9', '#0B1610', '#5D7368', '#C6DACC']
  },
  golden: {
    da: '#E8A22B', da2: '#F5C451', la: '#B57A0E', la2: '#9c6a0b',
    dark: ['#0A0806', '#16120D', '#1F1912', '#332A1D', '#241E15', '#F8F1E3', '#AE9F80', '#4A3A24'],
    light: ['#F9F2E2', '#FFFFFF', '#FFFFFF', '#EBDCB8', '#F3E9CE', '#1C1509', '#7D7052', '#DFCA9C']
  },
  amethyst: {
    da: '#A981F5', da2: '#C0A3FF', la: '#7C3AED', la2: '#6d28d9',
    dark: ['#0A0812', '#14101B', '#1C1624', '#2E2739', '#211A2C', '#F4F0F9', '#A49AB5', '#362D46'],
    light: ['#F5F1F9', '#FFFFFF', '#FFFFFF', '#E4DCF0', '#ECE5F5', '#150F20', '#6D6480', '#D3C6E6']
  },
  marine: {
    da: '#33D9A6', da2: '#5BE8BC', la: '#0F9E76', la2: '#0c8a66',
    dark: ['#050F0D', '#0B1916', '#11221E', '#1E332E', '#142823', '#EAF5F1', '#87A6A0', '#21403A'],
    light: ['#EFF5F3', '#FFFFFF', '#FFFFFF', '#D7E7E1', '#E3EFEB', '#0A1714', '#5B7770', '#C4DAD2']
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
