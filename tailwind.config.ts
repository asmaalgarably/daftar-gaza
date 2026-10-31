import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#070C18',
          900: '#0B132B',
          850: '#111C3E',
          800: '#1C2951',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        mint: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
};
export default config;
