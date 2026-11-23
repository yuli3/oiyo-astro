// 2026-11-23: 작은 아이콘 자리(≤ 48px)에는 128px 사본을 쓴다. 사본은
// scripts/build-image-thumbs.mjs 가 public/images/thumbs/128/ 에 만든다.
// 빌드 시점에 사본이 있는지 보고, 없으면 원본을 그대로 돌려준다(새 이미지를 넣고
// 스크립트를 깜빡해도 깨지지 않고 느려지기만 한다).
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const PREFIXES = ['/images/result-symbols/', '/images/test-icons/'];
const cache = new Map<string, string>();

export function thumbSrc(src: string | undefined | null): string | undefined {
  if (!src) return src ?? undefined;
  const hit = cache.get(src);
  if (hit) return hit;
  let out = src;
  if (src.endsWith('.webp') && PREFIXES.some((p) => src.startsWith(p))) {
    const candidate = '/images/thumbs/128/' + src.slice('/images/'.length);
    if (existsSync(join(PUBLIC_DIR, candidate))) out = candidate;
  }
  cache.set(src, out);
  return out;
}
