// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://oiyo.net',
  output: 'static',
  integrations: [react()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'ko',
    locales: ['en', 'ko', 'ja', 'cn', 'fr', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
