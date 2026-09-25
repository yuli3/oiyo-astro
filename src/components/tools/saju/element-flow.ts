/**
 * 사주 오행 장면의 상생 흐름 알갱이 수. 목→화→토→금→수→목 고리의 간선마다
 * 낳는 쪽 오행의 개수(여덟 자리 중 몇 자리)에 비례한다. 없는 오행은 흘려보내지 않고,
 * 받을 오행이 비어 있으면 그 앞에서 멈춰 쌓인다(`blocked`) — 우리의 지도 상생 오각형과
 * 같은 규칙이다.
 */
export const FLOW_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
export const PARTICLES_PER_SLOT = 12;

export interface FlowEdgePlan {
  from: number;
  to: number;
  particles: number;
  blocked: boolean;
}

export function planElementFlow(elementCount: Record<string, number>): FlowEdgePlan[] {
  return FLOW_ORDER.map((el, from) => {
    const to = (from + 1) % FLOW_ORDER.length;
    const count = Math.max(0, elementCount[el] || 0);
    return {
      from,
      to,
      particles: count * PARTICLES_PER_SLOT,
      blocked: (elementCount[FLOW_ORDER[to]] || 0) <= 0,
    };
  });
}
