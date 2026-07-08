import type { Config } from 'tailwindcss';

/**
 * Jarvis design tokens: near-black background, dark grey surfaces,
 * glass effects and arc-reactor blue highlights.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#05070b',
        surface: {
          DEFAULT: '#0c1017',
          raised: '#131926',
        },
        line: 'rgba(148, 163, 184, 0.12)',
        arc: {
          DEFAULT: '#38bdf8',
          soft: 'rgba(56, 189, 248, 0.15)',
          glow: 'rgba(56, 189, 248, 0.45)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
        glow: '0 0 24px rgba(56, 189, 248, 0.35)',
      },
      backdropBlur: {
        glass: '16px',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)' },
          '50%': { boxShadow: '0 0 32px rgba(56, 189, 248, 0.65)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
