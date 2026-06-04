// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];

export default defineConfig({
  site: 'https://oiyo.net',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path.split('/').some((seg) => seg.startsWith('_'))) return false;
        if (path.endsWith('/index/') || path === '/index') return false;
        return true;
      },
      lastmod: new Date(),
      serialize: (item) => {
        const p = new URL(item.url).pathname;
        const isKo = p.startsWith('/ko/') || p === '/ko';
        if (/^\/(ko|en|ja|zh|fr|es)\/?$/.test(p)) {
          return { ...item, priority: isKo ? 1.0 : 0.8, changefreq: 'weekly' };
        }
        if (/\/(ko|en|ja|zh|fr|es)\/tests\/?$/.test(p)) {
          return { ...item, priority: isKo ? 0.9 : 0.7, changefreq: 'weekly' };
        }
        if (/\/(mbti|enneagram)\//.test(p)) {
          return { ...item, priority: isKo ? 0.8 : 0.6, changefreq: 'monthly' };
        }
        if (/\/test\/?$/.test(p)) {
          return { ...item, priority: isKo ? 0.85 : 0.65, changefreq: 'weekly' };
        }
        return { ...item, priority: isKo ? 0.75 : 0.6, changefreq: 'weekly' };
      },
    }),
    robotsTxt(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'next-intl': path.resolve(__dirname, './src/lib/shims/next-intl.tsx'),
        'next-intl/server': path.resolve(__dirname, './src/lib/shims/next-intl.tsx'),
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
    locales: ['en', 'ko', 'ja', 'zh', 'fr', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
