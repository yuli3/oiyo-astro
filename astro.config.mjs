// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://oiyo.net',
  output: 'static',
  integrations: [react()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next-intl': path.resolve(__dirname, './src/lib/shims/next-intl.tsx'),
        'next/link': path.resolve(__dirname, './src/lib/shims/next-link.tsx'),
        'next/navigation': path.resolve(__dirname, './src/lib/shims/next-navigation.ts'),
        'next/dynamic': path.resolve(__dirname, './src/lib/shims/next-dynamic.ts'),
        '@clerk/nextjs': path.resolve(__dirname, './src/lib/shims/clerk.ts'),
        'next/image': path.resolve(__dirname, './src/lib/shims/next-image.tsx'),
        '@google/generative-ai': path.resolve(__dirname, './src/lib/shims/google-ai.ts'),
        // Redirect legacy src/messages/ imports to src/i18n/messages/
        '../messages': path.resolve(__dirname, './src/i18n/messages'),
      },
    },
  },
  i18n: {
    defaultLocale: 'ko',
    locales: ['en', 'ko', 'ja', 'cn', 'fr', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
