import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canonical domain. GitHub Pages also serves the site at jstevenfm.github.io,
  // so absolute URLs (sitemap, robots.txt) always point here.
  site: 'https://jstevenfm.com',
  integrations: [sitemap()],
  vite: {
    build: {
      // three.js (~630 kB) is its own lazily imported chunk, so it never blocks the first render.
      chunkSizeWarningLimit: 700,
    },
  },
});
