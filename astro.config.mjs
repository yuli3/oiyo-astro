// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkCjkFriendly from 'remark-cjk-friendly';
import robotsTxt from 'astro-robots-txt';
import hreflangReconcile from './src/integrations/hreflang-reconcile.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync } from 'node:fs';
import { isAssessmentRouteExcludedFromSitemap } from './config/assessment-release-gates.js';
import { isNoindexRoute } from './config/noindex-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCALES = ['ko', 'en', 'ja', 'zh', 'fr', 'es'];

// Locale deindex list. The 2026-07-14 crawl-budget deindex of zh/fr/es was
// reversed on 2026-09-24 (세운 decision): the list is empty and all six locales are indexable, self-canonical, in the
// sitemap and in the reciprocal hreflang cluster. The mechanism stays as a lever: a
// locale listed here leaves the index, the sitemap and the hreflang cluster together.
// Must stay in lockstep with Layout.astro's robots meta — sitemap-listed but
// noindex is a contradictory signal.
const DEINDEXED_LOCALES = new Set(
  JSON.parse(readFileSync(new URL('./src/i18n/deindexed-locales.json', import.meta.url), 'utf8')),
);
const SITEMAP_ENTRY_LIMIT = 100;

export default defineConfig({
  site: 'https://oiyo.net',
  output: 'static',
  // 한글·CJK 본문의 **강조**는 기본 파서가 인식하지 못한다 — 별표가 글자 그대로
  // 남는다. blog 가 같은 이유로 remark-cjk-friendly 를 쓰고 audit:emphasis 로
  // 지킨다. 표는 gfm 이 필요하다.
  markdown: {
    remarkPlugins: [remarkGfm, remarkCjkFriendly],
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      entryLimit: SITEMAP_ENTRY_LIMIT,
      i18n: {
        defaultLocale: 'ko',
        locales: {
          ko: 'ko',
          en: 'en',
          ja: 'ja',
          zh: 'zh-CN',
          fr: 'fr',
          es: 'es',
        },
      },
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path.split('/').some((seg) => seg.startsWith('_'))) return false;
        if (/\/ontology\/template\//.test(path)) return false;
        if (isAssessmentRouteExcludedFromSitemap(path)) return false;
        // noindex 페이지를 사이트맵에 올리면 모순 신호다.
        if (isNoindexRoute(path)) return false;
        if (path.endsWith('/index/') || path === '/index') return false;
        // Exclude deindexed locales (crawl budget).
        const segs = path.split('/').filter(Boolean);
        if (segs.length > 0 && DEINDEXED_LOCALES.has(segs[0])) return false;
        return true;
      },
      // Do not stamp every URL with the build time. A trustworthy per-route
      // source date may be added later; an unknown date is omitted.
      serialize: (item) => {
        const p = new URL(item.url).pathname;
        const isKo = p.startsWith('/ko/') || p === '/ko';
        if (/^\/(ko|en|ja|zh|fr|es)\/?$/.test(p)) {
          return { ...item, priority: isKo ? 1.0 : 0.8, changefreq: ChangeFreqEnum.WEEKLY };
        }
        if (/\/(ko|en|ja|zh|fr|es)\/tests\/?$/.test(p)) {
          return { ...item, priority: isKo ? 0.9 : 0.7, changefreq: ChangeFreqEnum.WEEKLY };
        }
        if (/\/(mbti|enneagram)\//.test(p)) {
          return { ...item, priority: isKo ? 0.8 : 0.6, changefreq: ChangeFreqEnum.MONTHLY };
        }
        if (/\/test\/?$/.test(p)) {
          return { ...item, priority: isKo ? 0.85 : 0.65, changefreq: ChangeFreqEnum.WEEKLY };
        }
        return { ...item, priority: isKo ? 0.75 : 0.6, changefreq: ChangeFreqEnum.WEEKLY };
      },
    }),
    robotsTxt({
      host: true,
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['*/search?*', '/search', '/api/', '*/ontology/template/*'],
        },
      ],
    }),
    // Runs after the build: hreflang only to built, indexable, reciprocal pages.
    hreflangReconcile(),
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
