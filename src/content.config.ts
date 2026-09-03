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

// 신비 계열 글 — blog 에서 넘어온다.
//
// 왜 별도 컬렉션인가: explainers 는 "한 주제당 한 편의 해설"이고 경로가
// /{locale}/{topic}/about 으로 고정이다. 이쪽은 한 주제 아래 여러 편이 서고
// 경로도 blog 시절 그대로 /{locale}/{slug} 를 유지한다 — URL 을 바꾸지 않는
// 것이 이관 비용을 가장 크게 줄인다.
//
// 왜 .mdx 인가: 원본 570편이 Callout·HighlightBox·Term·ResearchReference 를
// 쓴다. 마크다운으로 낮춰 옮기면 컴포넌트가 그대로 노출되고 인용이 사라진다 —
// 2026-09-02 심리 6주제에서 실제로 그렇게 깨뜨렸다. 같은 실수를 반복하지 않는다.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['ko', 'en', 'ja', 'zh', 'fr', 'es']),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** oiyo 주제 세그먼트. 목록·연결에 쓴다. 경로에는 넣지 않는다. */
    topic: z.string(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Oiyo'),
    series: z.string().optional(),
    chapter: z.number().optional(),
    imageUrl: z.string().optional(),
  }),
});

export const collections = { explainers, articles };
