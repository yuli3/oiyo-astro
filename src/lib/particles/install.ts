import { OIYO_TEST_RESULTS_UPDATED_EVENT } from "../user/test-results";
import { mountAmbient, playReveal } from "./engine";
import { REVEAL_COOLDOWN_MS, revealPresetFor, type RevealInput } from "./policy";

/**
 * Layout 이 모든 페이지에서 한 번 부른다.
 *
 * - 결과 공개: 끝난 검사는 모두 `recordTestResult()` 를 지나고 거기서
 *   `oiyo:test-results-updated` 가 결과를 detail 로 싣고 나간다. 그 이벤트 하나만
 *   들으므로 검사 120여 개를 하나씩 고치지 않아도 되고, 새 검사도 저절로 붙는다.
 *   삭제·가져오기 같은 detail 없는 발화는 연출하지 않는다.
 * - 배경 입자: `data-oiyo-ambient` 가 붙은 요소 뒤에 깐다(`AmbientParticles.astro`).
 */
export function installSiteParticles(): void {
  if (typeof window === "undefined") return;
  const flag = window as unknown as { __oiyoParticles?: boolean };
  if (flag.__oiyoParticles) return;
  flag.__oiyoParticles = true;

  let lastReveal = 0;
  window.addEventListener(OIYO_TEST_RESULTS_UPDATED_EVENT, (event) => {
    const preset = revealPresetFor((event as CustomEvent<RevealInput | undefined>).detail);
    if (!preset) return;
    const now = Date.now();
    if (now - lastReveal < REVEAL_COOLDOWN_MS) return;
    lastReveal = now;
    // 결과 화면이 먼저 그려진 뒤에 터지도록 한 박자 늦춘다.
    window.setTimeout(() => playReveal(preset), 180);
  });

  for (const host of document.querySelectorAll<HTMLElement>("[data-oiyo-ambient]")) {
    const colors = host.dataset.oiyoAmbientColors?.split(",").map((c) => c.trim()).filter(Boolean);
    const density = Number(host.dataset.oiyoAmbientDensity);
    mountAmbient(host, {
      colors: colors?.length ? colors : undefined,
      density: Number.isFinite(density) && density > 0 ? density : undefined,
      links: host.dataset.oiyoAmbientLinks !== "false",
    });
  }
}
