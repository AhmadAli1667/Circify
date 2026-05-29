/** @type {import('tailwindcss').Config} */
// JSDoc type annotation — tells editors this object matches Tailwind's Config shape for autocomplete

export default {
  // Exports the Tailwind configuration object

  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Tells Tailwind which files to scan for class names; unused classes get removed from the final CSS build

  theme: {
    // Overrides or extends Tailwind's default design tokens (colors, fonts, shadows, etc.)

    extend: {
      // extend keeps all of Tailwind's defaults and adds these on top — without it we'd replace the defaults

      colors: {
        // Custom color tokens available as Tailwind classes like bg-bg, text-primary, etc.

        bg: '#050505',
        // Near-black background color — used as the page base (bg-bg)

        surface: '#121212',
        // Slightly lighter dark grey — used for cards, panels, and elevated surfaces (bg-surface)

        primary: '#E50914',
        // Netflix-red accent color — used for highlights, buttons, icons, and hover states (text-primary, bg-primary)

        text: '#FFFFFF',
        // Pure white — the default text color (text-text)

        muted: '#A3A3A3',
        // Medium grey — used for secondary/helper text, placeholders, and subdued UI (text-muted)
      },

      fontFamily: {
        // Custom font stack; overrides Tailwind's default sans-serif font

        sans: ['Inter', 'Roboto', 'sans-serif'],
        // Inter is loaded from Google Fonts; Roboto is the fallback; generic sans-serif is the final fallback
      },

      boxShadow: {
        // Custom shadow utility available as shadow-glass

        glass: '0 10px 30px rgba(0, 0, 0, 0.35)',
        // Soft dark drop-shadow used on modals and floating panels to create a glassmorphism depth effect
      },
    },
  },

  plugins: [],
  // No Tailwind plugins used; could add @tailwindcss/forms, @tailwindcss/typography, etc. here
}
