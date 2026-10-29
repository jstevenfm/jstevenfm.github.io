import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jstevenfm.com',
  vite: {
    build: {
      // three.js (~630 kB) is its own lazily imported chunk, so it never blocks the first render.
      chunkSizeWarningLimit: 700,
    },
  },
});
