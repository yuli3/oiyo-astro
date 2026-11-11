import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAnswerBlock, TEST_ANSWER_BLOCKS } from './test-answer-blocks';

// 2026-11-08: 답변 블록이 지켜야 할 것 — 실제 페이지에 붙고, 페이지가 이미 내는 구조화
// 데이터와 겹치지 않고, 결과 유형 이름을 지어내지 않는다.
const root = resolve(__dirname, '../..');

function pageFile(path: string): string | null {
  for (const candidate of [`src/pages/[locale]${path}.astro`, `src/pages/[locale]${path}/index.astro`]) {
    if (existsSync(resolve(root, candidate))) return resolve(root, candidate);
  }
  return null;
}

/** 페이지가 쓰는 검사 컴포넌트와, 그 컴포넌트가 가져오는 src 안 파일의 소스를 합친다. */
function componentSources(page: string): string {
  const pageSource = readFileSync(page, 'utf8');
  const sources: string[] = [];
  const importPattern = /import\s+\w+\s+from\s+'([^']*components\/tests\/[^']+)'/g;
  for (const match of pageSource.matchAll(importPattern)) {
    const file = resolve(dirname(page), match[1].endsWith('.tsx') ? match[1] : `${match[1]}.tsx`);
    const source = readFileSync(file, 'utf8');
    sources.push(source);
    for (const dep of source.matchAll(/from\s+["']@\/(lib\/[^"']+)["']/g)) {
      const depFile = resolve(root, 'src', `${dep[1]}.ts`);
      if (existsSync(depFile)) sources.push(readFileSync(depFile, 'utf8'));
    }
  }
  return sources.join('\n');
}

describe('test answer blocks', () => {
  const entries = Object.entries(TEST_ANSWER_BLOCKS);

  it('covers the first 20 tests', () => {
    expect(entries.length).toBeGreaterThanOrEqual(20);
  });

  it.each(entries)('%s is attached to a real page without duplicate schema', (path) => {
    expect(path).not.toMatch(/\/$/);
    const page = pageFile(path);
    expect(page, `no page for ${path}`).not.toBeNull();
    const source = readFileSync(page as string, 'utf8');
    // Layout 이 블록의 문답으로 FAQPage 를, 블록이 Quiz 를 낸다 — 페이지에 이미 있으면 두 번이 된다.
    for (const marker of ['FAQPage', 'TestExplainer', 'buildQuizJsonLd', 'FaqAccordion']) {
      expect(source.includes(marker), `${path} already has ${marker}`).toBe(false);
    }
  });

  it.each(entries)('%s Korean block is complete and uses the component’s own result names', (path) => {
    const block = getAnswerBlock(path, 'ko');
    expect(block).not.toBeNull();
    if (!block) return;
    expect(block.answer.length).toBeGreaterThanOrEqual(60);
    expect(block.faqs).toHaveLength(3);
    expect(block.types.length).toBeGreaterThanOrEqual(2);
    const names = block.types.map((type) => type.name);
    expect(new Set(names).size).toBe(names.length);
    const sources = componentSources(pageFile(path) as string);
    for (const name of names) {
      const bare = name.replace(/\([A-Z]\)$/, '');
      expect(sources.includes(bare), `${path}: "${bare}" is not a result name in the component`).toBe(true);
    }
  });

  it('renders nothing for a locale without written content', () => {
    expect(getAnswerBlock('/hsp-test', 'en')).toBeNull();
    expect(getAnswerBlock('/not-a-test', 'ko')).toBeNull();
  });
});
