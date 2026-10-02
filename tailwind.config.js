/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dusk"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2.5rem',
      },
      screens: {
        '2xl': '1360px',
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--btc-ink)',
          soft: 'var(--btc-ink-soft)',
          raised: 'var(--btc-ink-raised)',
        },
        canvas: {
          DEFAULT: 'var(--btc-canvas)',
          dim: 'var(--btc-canvas-dim)',
          deep: 'var(--btc-canvas-deep)',
        },
        pomelo: {
          DEFAULT: 'var(--btc-pomelo)',
          soft: 'var(--btc-pomelo-soft)',
          deep: 'var(--btc-pomelo-deep)',
        },
        kesar: {
          DEFAULT: 'var(--btc-kesar)',
          soft: 'var(--btc-kesar-soft)',
          deep: 'var(--btc-kesar-deep)',
        },
        pistachio: {
          DEFAULT: 'var(--btc-pistachio)',
          soft: 'var(--btc-pistachio-soft)',
          deep: 'var(--btc-pistachio-deep)',
        },
        rose: {
          DEFAULT: 'var(--btc-rose)',
          soft: 'var(--btc-rose-soft)',
          deep: 'var(--btc-rose-deep)',
        },
        mulberry: {
          DEFAULT: 'var(--btc-mulberry)',
          soft: 'var(--btc-mulberry-soft)',
          deep: 'var(--btc-mulberry-deep)',
        },
        silver: {
          DEFAULT: 'var(--btc-silver)',
          soft: 'var(--btc-silver-soft)',
          bright: 'var(--btc-silver-bright)',
        },
        // Semantic roles, resolved per-theme via CSS variables
        surface: 'rgb(var(--btc-surface-rgb) / <alpha-value>)',
        'surface-raised': 'rgb(var(--btc-surface-raised-rgb) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--btc-surface-sunken-rgb) / <alpha-value>)',
        line: 'rgb(var(--btc-line-rgb) / <alpha-value>)',
        body: 'rgb(var(--btc-body-rgb) / <alpha-value>)',
        muted: 'rgb(var(--btc-muted-rgb) / <alpha-value>)',
        accent: 'rgb(var(--btc-accent-rgb) / <alpha-value>)',
        'accent-ink': 'rgb(var(--btc-accent-ink-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        dyslexia: ['"Atkinson Hyperlegible"', '"Bricolage Grotesque"', 'sans-serif'],
      },
      fontSize: {
        // fluid, accessibility-scale friendly
        'display-sm': ['clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        display: ['clamp(2.25rem, 1.4rem + 3.6vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.75rem, 1.5rem + 5.4vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        title: ['clamp(1.25rem, 1rem + 1.1vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
        scallop: 'var(--btc-radius-scallop)',
      },
      boxShadow: {
        // Soft layered shadows tinted with aubergine
        'btc-sm': '0 1px 2px rgb(45 18 56 / 0.06), 0 2px 6px rgb(45 18 56 / 0.05)',
        btc: '0 2px 4px rgb(45 18 56 / 0.06), 0 8px 20px -6px rgb(45 18 56 / 0.14)',
        'btc-lg': '0 4px 10px rgb(45 18 56 / 0.08), 0 20px 44px -12px rgb(45 18 56 / 0.24)',
        'btc-xl': '0 8px 20px rgb(45 18 56 / 0.1), 0 36px 80px -20px rgb(45 18 56 / 0.34)',
        'btc-inset': 'inset 0 1px 0 rgb(207 210 218 / 0.55), inset 0 -1px 0 rgb(45 18 56 / 0.06)',
        'btc-pomelo': '0 6px 0 0 var(--btc-pomelo-deep), 0 14px 28px -8px rgb(255 111 142 / 0.55)',
        'btc-kesar': '0 6px 0 0 var(--btc-kesar-deep), 0 14px 28px -8px rgb(242 179 61 / 0.5)',
        'btc-sticker': '0 3px 0 0 rgb(45 18 56 / 0.18), 0 8px 18px -6px rgb(45 18 56 / 0.3)',
      },
      backgroundImage: {
        'dusk-fruit': 'linear-gradient(135deg, var(--btc-pomelo) 0%, var(--btc-kesar) 100%)',
        'barfi-glow': 'linear-gradient(135deg, var(--btc-pistachio) 0%, var(--btc-canvas) 100%)',
        'mulberry-deep': 'linear-gradient(160deg, var(--btc-mulberry) 0%, var(--btc-ink) 100%)',
        'jaali':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%232D1238' stroke-opacity='0.16' stroke-width='1'%3E%3Cpath d='M24 2 46 24 24 46 2 24z'/%3E%3Cpath d='M24 12 36 24 24 36 12 24z'/%3E%3Ccircle cx='24' cy='24' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E\")",
        shimmer:
          'linear-gradient(100deg, transparent 20%, rgb(242 179 61 / 0.55) 42%, rgb(244 166 183 / 0.7) 52%, transparent 74%)',
      },
      backgroundSize: {
        jaali: '48px 48px',
        grain: '140px 140px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '20%': { opacity: '1', transform: 'translateY(-10px) scale(1.06)' },
          '100%': { transform: 'translateY(-140px) scale(0.9)', opacity: '0' },
        },
        'varq-sweep': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'bounce-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.45' },
          '30%': { transform: 'translateY(-5px)', opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-1.4deg)' },
          '50%': { transform: 'rotate(1.4deg)' },
        },
        'reveal-scallop': {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
      animation: {
        'float-up': 'float-up 1.6s ease-out forwards',
        'varq-sweep': 'varq-sweep 1.1s ease-in-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        sway: 'sway 6s ease-in-out infinite',
        'reveal-scallop': 'reveal-scallop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
    },
  },
  plugins: [],
};
