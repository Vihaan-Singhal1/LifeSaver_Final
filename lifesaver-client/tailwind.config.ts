import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['forest']
  }
};

export default config;
