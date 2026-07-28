import { shareResultImage, type ShareCardPayload } from './share-result-image';

export type SajuSharePillar = { label: string; stem: string | null; branch: string | null; animal: string; element: string };
export type SajuSharePayload = { locale: string; title: string; disclaimer: string; pillars: readonly [SajuSharePillar, SajuSharePillar, SajuSharePillar, SajuSharePillar] };

export function assertSajuSharePayload(payload: SajuSharePayload): void {
  if (!['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(payload.locale) || payload.pillars.length !== 4) throw new Error('invalid share payload');
  for (const [index, pillar] of payload.pillars.entries()) {
    const unknown = pillar.stem === null || pillar.branch === null;
    if (!pillar.label || !pillar.element || (unknown && index !== 3) || (unknown && (pillar.stem !== null || pillar.branch !== null))) throw new Error('invalid pillar');
  }
}

export async function shareSajuCard(payload: SajuSharePayload) {
  assertSajuSharePayload(payload);
  const description = payload.pillars.map((p) => `${p.label}: ${p.stem ?? '—'}${p.branch ?? ''} · ${p.element}`).join('\n');
  const card: ShareCardPayload = { heading: payload.title, resultTitle: '四柱八字', description: `${description}\n${payload.disclaimer}`, url: 'oiyo.net' };
  return shareResultImage(card, 'oiyo-saju-card.png');
}
