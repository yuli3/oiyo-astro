// Approved 2026-11-06: deterministic chroma-key derivatives preserve Grok's
// original artwork; source JPEGs and their manifests are never overwritten.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const input = process.argv[2];
if (!input || process.argv.length !== 3) throw new Error('Usage: node scripts/build-timeslip-ui-assets.mjs SOURCE_DIRECTORY');
const output = resolve('public/images/timeslip-ui-v2');
const manifest = (await readFile(resolve(input, 'manifest.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
const files = [
  'hopae/wood-blank', 'hopae/cord-red', 'decor/wax-seal-blank', 'tablets/ivory', 'tablets/wood',
  ...['red', 'blue', 'green'].map(c => `robes/joseon-${c}`),
  ...['purple', 'crimson', 'blue', 'yellow'].map(c => `robes/silla-${c}`),
  'robes/silla-commoner',
  ...['joseon', 'silla', 'france', 'europe', 'us', 'florence'].map(c => `cards/${c}-blank`),
];
const records = [];
for (const name of files) {
  const bytes = await readFile(resolve(input, `${name}.jpg`));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const isCard = name.startsWith('cards/');
  const key = name === 'robes/silla-purple' ? 'green' : name.startsWith('hopae/') ? 'cyan' : 'magenta';
  if (!isCard) {
    for (let p = 0; p < data.length; p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      const excess = key === 'green' ? g - Math.max(r, b) : key === 'cyan' ? Math.min(g, b) - r : Math.min(r, b) - g;
      const t = Math.max(0, Math.min(1, (excess - 18) / 42));
      data[p + 3] = Math.round(255 * (1 - t * t * (3 - 2 * t)));
      // The enclosed hopae hole is pale blue, not the outside chroma colour.
      // Mask only the measured interior; preserve the brown rim and all lining.
      if (name === 'hopae/wood-blank') {
        const x = (p / 4) % info.width, y = Math.floor(p / 4 / info.width);
        if (((x - 362) / 14.5) ** 2 + ((y - 172) / 15.5) ** 2 < 1) data[p + 3] = 0;
      }
    }
  }
  if (!isCard) {
    // JPEG chroma subsampling contaminates a thin edge. Contract the mask two
    // source pixels rather than leaving a cyan/magenta halo on dark themes.
    const alpha = Uint8Array.from({ length: info.width * info.height }, (_, i) => data[i * 4 + 3]);
    for (let y = 2; y < info.height - 2; y++) for (let x = 2; x < info.width - 2; x++) {
      let a = alpha[y * info.width + x];
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) a = Math.min(a, alpha[(y + dy) * info.width + x + dx]);
      data[(y * info.width + x) * 4 + 3] = a;
    }
  }
  const dest = resolve(output, `${name}.webp`);
  await mkdir(dirname(dest), { recursive: true });
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: isCard ? 720 : 640, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 100 }).toFile(dest);
  const meta = await sharp(dest).metadata();
  records.push({ file: `${name}.webp`, source: `${name}.jpg`, sourceSha256: createHash('sha256').update(bytes).digest('hex'), width: meta.width, height: meta.height, alpha: !isCard, derivation: isCard ? 'resize-webp' : `chroma-${key}-v1`, illustration: 'AI-created fictional interpretation; not a clothing reconstruction' });
}
await writeFile(resolve(output, 'manifest.json'), JSON.stringify({ version: 1, sourceManifestRows: manifest.length, files: records }, null, 2) + '\n');
console.log(`Wrote ${records.length} derivatives; original JPEGs unchanged.`);
