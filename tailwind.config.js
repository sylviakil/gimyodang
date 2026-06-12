/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gimyo: {
          deep:    '#0D0B08',
          warm:    '#1A1510',
          surface: '#231E18',
          paper:   '#F2E8D5',
          gold:    '#C9A84C',
          celadon: '#7BA99A',
          crimson: '#8B2635',
        },
        era: {
          joseon: '#C9A84C',
          modern: '#4A6580',
        },
        desire: {
          forgetting: '#3D4F6B',
          love:       '#8B3A4A',
          power:      '#5C4A1A',
          truth:      '#2A4A5C',
          revenge:    '#2C1A1A',
          return:     '#3A4A2A',
          freedom:    '#2A3A4A',
        },
      },
      fontFamily: {
        serif: ['Nanum Myeongjo', 'Georgia', 'serif'],
        sans:  ['Nanum Gothic', 'sans-serif'],
      },
      keyframes: {
        candleFlicker: {
          '0%, 100%': { opacity: '1', transform: 'scaleY(1)' },
          '25%':       { opacity: '0.85', transform: 'scaleY(0.97)' },
          '50%':       { opacity: '0.95', transform: 'scaleY(1.02)' },
          '75%':       { opacity: '0.8', transform: 'scaleY(0.98)' },
        },
        plumfall: {
          '0%':   { transform: 'translateY(-10px) translateX(0) rotate(0deg)', opacity: '0' },
          '10%':  { opacity: '0.6' },
          '90%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(100vh) translateX(80px) rotate(360deg)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          from: { width: '0' },
          to:   { width: '100%' },
        },
      },
      animation: {
        candle:   'candleFlicker 3s ease-in-out infinite',
        plumfall: 'plumfall linear infinite',
        fadeIn:   'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
