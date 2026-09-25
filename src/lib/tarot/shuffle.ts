/**
 * 타로 덱 섞기. Fisher–Yates — 모든 순서가 같은 확률로 나온다.
 *
 * 예전에는 `sort(() => Math.random() - 0.5)` 로 섞었는데, 비교 함수가 일관되지
 * 않으면 정렬 알고리즘에 따라 원래 자리 근처에 남는 카드가 더 자주 뽑힌다.
 * 한 장 뽑기에서 카드마다 뽑힐 확률이 1/22 에서 벗어났다.
 */
export function shuffleDeck<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
