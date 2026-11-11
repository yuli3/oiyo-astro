// 나의 수호신 찾기. 다섯 원형 × 네 신화 = 20명. 결과는 이미 있는 신화 인물 사전 글로 잇는다.
// 2026-11-09 세운 결재(발굴 1번), company-brain think-tank/2026-11-09-oiyo-content-discovery.md.
//
// 원형은 문항 점수로, 신화는 마지막 "끌리는 풍경" 문항으로 고른다. 같은 점수면 아래 순서가 앞서는 쪽.

export const ARCHETYPES = ['guardian', 'sage', 'pioneer', 'healer', 'trickster'] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export const PANTHEONS = ['greek', 'norse', 'egyptian', 'korean'] as const;
export type Pantheon = (typeof PANTHEONS)[number];

/** 원형 × 신화 → 인물 사전 글 slug 의 뒷부분(meaning-of-myth-<id>). */
export const GUARDIANS: Record<Archetype, Record<Pantheon, string>> = {
  guardian: { greek: 'athena', norse: 'heimdall', egyptian: 'anubis', korean: 'haetae' },
  sage: { greek: 'apollo', norse: 'odin', egyptian: 'thoth', korean: 'chilseongsin' },
  pioneer: { greek: 'hermes', norse: 'thor', egyptian: 'horus', korean: 'jumong' },
  healer: { greek: 'demeter', norse: 'frigg', egyptian: 'isis', korean: 'bari-gongju' },
  trickster: { greek: 'dionysus', norse: 'loki', egyptian: 'bastet', korean: 'dokkaebi' },
};

export const GUARDIAN_IDS = ARCHETYPES.flatMap((a) => PANTHEONS.map((p) => GUARDIANS[a][p]));

/** answers[i] = 고른 보기 번호. 앞 문항들은 보기 번호가 곧 원형 번호이고, 마지막 문항은 신화 번호다. */
export function castGuardian(answers: number[]): { archetype: Archetype; pantheon: Pantheon; id: string; scores: number[] } {
  if (answers.length < 2) throw new RangeError('answers');
  const scores = ARCHETYPES.map(() => 0);
  for (const a of answers.slice(0, -1)) {
    if (!Number.isInteger(a) || a < 0 || a >= ARCHETYPES.length) throw new RangeError('answer');
    scores[a] += 1;
  }
  const p = answers[answers.length - 1];
  if (!Number.isInteger(p) || p < 0 || p >= PANTHEONS.length) throw new RangeError('pantheon');
  const best = scores.indexOf(Math.max(...scores));
  const archetype = ARCHETYPES[best];
  const pantheon = PANTHEONS[p];
  return { archetype, pantheon, id: GUARDIANS[archetype][pantheon], scores };
}

/** "헤임달(Heimdall) — 북유럽 …" 같은 글 제목에서 인물 이름만 뗀다. */
export function mythNameFromTitle(title: string): string {
  return title.split(' — ')[0].trim();
}
