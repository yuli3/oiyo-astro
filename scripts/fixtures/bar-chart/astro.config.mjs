import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// 2026-10-12: a separate build root keeps test cases out of production routes/sitemaps.
export default defineConfig({
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
