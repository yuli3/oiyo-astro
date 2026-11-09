import { describe, it, expect } from 'vitest';
import { layoutCard, type CardText } from './timeslip-card-layout';
const spec: CardText = { kicker: 'OIYO', title: 'Chief State Councillor', subtitle: 'Senior 1st rank', badge: 'One in a million', lines: ['Gyeonggi', 'Red court robe'], footer: 'oiyo.net', accent: '#000' };
const measure = (s: string, size: number) => [...s].length * size * .7;
describe('card text export boundary', () => {
  it('keeps all fields, inside the paper safe area, at its native 3:4 ratio', () => {
    for (const text of ['대광보국숭록대부', 'Conseillère du Conseil des affaires de l’État', '這是一段沒有空格的長文字'.repeat(5), 'AnUnbrokenLongWord'.repeat(12)]) {
      const input = { ...spec, title: text, lines: [text, text] };
      const lines = layoutCard(input, measure);
      expect(lines.length).toBeGreaterThan(5);
      expect(lines[0].y).toBeGreaterThan(150);
      expect(lines.at(-1)!.y).toBeLessThan(810);
      for (const line of lines) expect(measure(line.text, line.size)).toBeLessThanOrEqual(480);
      expect(lines.map(x => x.text).join('').replace(/\s/g, '')).toContain(text.replace(/\s/g, ''));
    }
  });
});
