import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { SOUND_SLOTS, ambientFor } from './sounds';

describe('sanctuary sound slots', () => {
  it('every filled slot points at a real file that the manifest credits', () => {
    const manifest = JSON.parse(readFileSync('public/sounds/sanctuary/manifest.json', 'utf8')) as { files: { file: string; source: string }[] };
    for (const slot of Object.values(SOUND_SLOTS)) {
      if (slot.file === null) continue;
      expect(existsSync(`public${slot.file}`), slot.file).toBe(true);
      const entry = manifest.files.find((f) => slot.file.endsWith(`/${f.file}`));
      expect(entry?.source.length ?? 0, `${slot.file} has no source in manifest.json`).toBeGreaterThan(5);
    }
  });
  it('skips empty slots and maps scenes to their loops', () => {
    expect(ambientFor('temple')).toEqual(['stream', 'chant']);
    expect(ambientFor('fire')).toEqual(['firewood']);
    expect(ambientFor('water')).toEqual(['stream']);
    expect(ambientFor('fireflies')).toEqual(['stream']);
    expect(ambientFor('rain')).toEqual([]);
    expect(ambientFor('fireworks')).toEqual([]);
  });
});
