/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        elev: 'var(--elev)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        sub: 'var(--sub)',
        mute: 'var(--mute)',
        brand: 'var(--brand)',
        ok: 'var(--ok)',
        bad: 'var(--bad)',
        warn: 'var(--warn)',
        okbg: 'var(--okbg)',
        badbg: 'var(--badbg)',
      }
    },
  },
  plugins: [],
}