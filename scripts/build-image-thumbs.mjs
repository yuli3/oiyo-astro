#!/usr/bin/env node
// 2026-11-23 LCP 작업: 홈·목록에서 20~36px로 보이는 아이콘이 원본(수백 px, 20~150KB)을
// 그대로 받아 모바일 첫 화면에서 약 950KB를 썼다. 그 바이트가 제목 서체와 대역폭을
// 다퉈 LCP(제목)가 늦어졌다. 작은 자리(≤ 48px)에는 128px 사본을 쓴다(48px × 모바일 DPR 2.6 ≈ 125px).
//
//   node scripts/build-image-thumbs.mjs          # 없거나 원본보다 오래된 사본만 다시 만든다
//   node scripts/build-image-thumbs.mjs --check  # 빠진 사본이 있으면 실패
//
// 사본은 public/images/thumbs/128/<원본 경로> 에 커밋한다. 화면 쪽은
// src/lib/images/thumb.ts 의 thumbSrc() 가 사본이 있을 때만 바꿔 준다.
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import sharp from 'sharp';

const SIZE = 128;
const ROOT = new URL('../public/images/', import.meta.url).pathname;
const DIRS = ['result-symbols', 'test-icons'];
const OUT = join(ROOT, 'thumbs', String(SIZE));
const check = process.argv.includes('--check');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.webp')) yield p;
  }
}

let made = 0, missing = [];
for (const d of DIRS) {
  for (const src of walk(join(ROOT, d))) {
    const rel = relative(ROOT, src);
    const dst = join(OUT, rel);
    if (existsSync(dst) && statSync(dst).mtimeMs >= statSync(src).mtimeMs) continue;
    if (check) { if (!existsSync(dst)) missing.push(rel); continue; }
    mkdirSync(dirname(dst), { recursive: true });
    await sharp(src).resize(SIZE, SIZE, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(dst);
    made++;
  }
}
if (check) {
  if (missing.length) { console.error(`thumbs missing (${missing.length}):\n  ` + missing.join('\n  ') + '\nrun: node scripts/build-image-thumbs.mjs'); process.exit(1); }
  console.log('thumbs ok');
} else console.log(`thumbs: ${made} written to ${relative(process.cwd(), OUT)}`);
