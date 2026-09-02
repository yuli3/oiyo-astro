// 개념 해설 컬렉션 — wiki 에서 옮겨 온 6개 심리 주제의 설명 본문.
//
// 이 6개는 oiyo 에 이미 테스트 페이지가 있는데 해설은 wiki 에만 있었다. 사이트 간
// 중복 금지 원칙(2026-09-02)에 따라 해설을 oiyo 로 모으고 wiki 쪽은 넘긴다.
//
// 왜 마크다운인가: 6개 문서의 절 구조가 제각각이다(번호 붙은 에세이 4개, 사전형
// 2개). 타입 레코드 스키마로 묶으면 글이 뒤틀린다. Astro 는 .md 컬렉션을 기본
// 내장하므로 새로 설치할 것도 없다.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const explainers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/explainers' }),
  schema: z.object({
    /** oiyo 라우트 세그먼트. /{locale}/{topic}/about 로 열린다. */
    topic: z.string(),
    locale: z.enum(['ko', 'en', 'ja', 'zh', 'fr', 'es']),
    title: z.string(),
    description: z.string(),
    /** 한 문장 정의. 목록·JSON-LD 용. */
    definition: z.string(),
    updated: z.coerce.date(),
  }),
});

export const collections = { explainers };
