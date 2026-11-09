export interface CardText { kicker: string; title: string; subtitle?: string; lines: string[]; badge: string; footer: string; accent: string }
export interface CardLine { text: string; x: number; y: number; size: number; bold: boolean; accent: boolean }

// 2026-11-06: wrap by Unicode code point, including unspaced CJK and long words.
// All fields share one fitted layout so long translations cannot clip silently.
export function layoutCard(spec: CardText, measure: (text: string, size: number, bold: boolean) => number): CardLine[] {
  const fields = [
    { text: spec.kicker, size: 26, bold: true },
    { text: spec.title, size: 54, bold: true },
    ...(spec.subtitle ? [{ text: spec.subtitle, size: 28, bold: true }] : []),
    { text: spec.badge, size: 30, bold: true, accent: true },
    ...spec.lines.map(text => ({ text, size: 28, bold: false })),
    { text: spec.footer, size: 22, bold: false },
  ];
  for (let scale = 1; scale >= .1; scale -= .025) {
    const lines: (Omit<CardLine, 'x' | 'y'> & { gap?: number })[] = [];
    let total = 0;
    for (const field of fields) {
      const size = Math.max(8, Math.floor(field.size * scale));
      let line = '';
      const add = (text: string) => {
        if (!text.trim()) return;
        lines.push({ text: text.trim(), size, bold: field.bold, accent: 'accent' in field });
        total += size * 1.35;
      };
      for (const ch of field.text) {
        if (ch === '\n') { add(line); line = ''; continue; }
        if (line && measure(line + ch, size, field.bold) > 480) {
          const space = line.lastIndexOf(' ');
          if (space > 0) { add(line.slice(0, space)); line = line.slice(space + 1) + ch; }
          else { add(line); line = ch; }
        } else line += ch;
      }
      add(line);
      total += 12 * scale;
      // Store the field gap in the final line's line advance below.
      if (lines.length) lines[lines.length - 1] = { ...lines[lines.length - 1], gap: 12 * scale };
    }
    if (total <= 640) {
      let y = 160 + (640 - total) / 2;
      return lines.map(line => {
        const entry = { ...line, x: 360, y: y + line.size };
        y += line.size * 1.35 + ('gap' in line ? Number(line.gap) : 0);
        return entry;
      });
    }
  }
  throw new Error('Card text exceeds the readable export area');
}
