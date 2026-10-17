export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
  // ✅ Enable `dir` support
  variants: {
    extend: {
      inset: ['rtl'],
      margin: ['rtl'],
      padding: ['rtl'],
      textAlign: ['rtl'],
    },
  },
}
