export default {
  // Exports the PostCSS configuration — PostCSS runs CSS transformations as part of the Vite build pipeline

  plugins: {
    // Lists the PostCSS plugins to apply in order during CSS processing

    tailwindcss: {},
    // Runs the Tailwind CSS plugin — generates utility classes from the tailwind.config.js and injects them

    autoprefixer: {}
    // Automatically adds vendor prefixes (e.g. -webkit-, -moz-) to CSS properties for cross-browser compatibility
  }
}
//working
// Dev note left by the developer confirming this config file is active and functioning
