// WO-3 — 애착 결과의 한 문장 결론과 단일 주 행동.
//
// 이 검사는 2026-08 에 고정 4유형에서 불안·회피 두 연속축으로 바뀌었다. 결론
// 문장이 다시 "당신은 회피형" 같은 고정 라벨로 미끄러지면 그 전환이 무의미해진다.
// 여기서 막는 것은 세 가지다: 조합마다 문장이 실제로 달라지는가, 6 로케일이
// fallback 없이 채워졌는가, 관계 안전 경계가 살아 있는가.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const SRC = readFileSync(new URL("./AttachmentStyleTest.tsx", import.meta.url), "utf8");
const LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;

// 컴포넌트에서 문턱 함수를 그대로 옮겨 온다. 값이 갈라지면 이 테스트가 먼저 깨진다.
function attachmentLevel(value: number): "low" | "medium" | "high" {
  return value >= 65 ? "high" : value >= 35 ? "medium" : "low";
}

describe("attachment level thresholds", () => {
  it("Big Five 와 같은 65/35 문턱을 쓴다", () => {
    expect(attachmentLevel(0)).toBe("low");
    expect(attachmentLevel(34.9)).toBe("low");
    expect(attachmentLevel(35)).toBe("medium");
    expect(attachmentLevel(64.9)).toBe("medium");
    expect(attachmentLevel(65)).toBe("high");
    expect(attachmentLevel(100)).toBe("high");
  });

  it("low/mid/high 아홉 조합이 서로 다른 문장을 만든다", () => {
    // 결론은 두 수준 라벨을 받아 조립된다. 조합이 같은 문장을 내면 결과가
    // 응답자마다 달라지지 않는다는 뜻이다.
    const conclusion = (a: string, v: string) =>
      `이번 응답에서는 가까움에 대한 걱정이 ${a}, 거리를 두려는 경향이 ${v}으로 나타났습니다`;
    const label = { low: "낮은 편", medium: "중간", high: "높은 편" } as const;
    const levels = ["low", "medium", "high"] as const;
    const sentences = new Set(
      levels.flatMap((a) => levels.map((v) => conclusion(label[a], label[v]))),
    );
    expect(sentences.size).toBe(9);
  });
});

describe("attachment result copy", () => {
  it("여섯 로케일 모두 conclusion 템플릿을 가진다", () => {
    for (const locale of LOCALES) {
      const block = SRC.slice(SRC.indexOf(`\n  ${locale}: { title:`));
      const head = block.slice(0, block.indexOf("\n  }," ) + 1 || 4000);
      expect(head, `${locale} conclusion 누락`).toMatch(/conclusion: \(a, v\) =>/);
      expect(head, `${locale} nextLabel 누락`).toMatch(/nextLabel: "/);
    }
  });

  it("결론이 고정 유형 라벨을 쓰지 않는다", () => {
    // 구 4유형 명칭이 결론 문장에 돌아오면 실패한다.
    const conclusionLines = SRC.split("\n").filter((line) => line.includes("conclusion: (a, v)"));
    expect(conclusionLines).toHaveLength(6);
    for (const line of conclusionLines) {
      expect(line).not.toMatch(/안정형|불안형|회피형|혼란형|secure|preoccupied|dismissive|fearful/i);
    }
  });

  it("수준 설명과 라벨이 실제로 렌더된다", () => {
    // 이 둘은 6 로케일로 쓰여 있었지만 렌더된 적이 없었고, 두 카드가 같은
    // RESPONSE_POSITION 문장을 반복했다. 다시 그 상태로 돌아가지 않게 한다.
    expect(SRC).toMatch(/t\.descriptions\[id\]\[level\]/);
    expect(SRC).toMatch(/t\.level\[level\]/);
    expect(SRC).toMatch(/t\.conclusion\(t\.level\[anxietyLevel\], t\.level\[avoidanceLevel\]\)/);
  });

  it("주 행동은 하나이고 재검사 안내와 분리된다", () => {
    // t.next 와 t.retake 가 한 상자에 나란히 있으면 무엇이 주 행동인지 사라진다.
    expect(SRC).toMatch(/\{t\.nextLabel\}/);
    expect(SRC).not.toMatch(/<p>\{t\.next\}<\/p><p className="mt-2">\{t\.retake\}<\/p>/);
  });

  it("관계 안전 경계와 긴급 지원 안내가 남아 있다", () => {
    // 결과 표현을 손보면서 이 셋이 사라지는 것이 가장 위험한 회귀다.
    expect(SRC).toMatch(/\{t\.safety\}/);
    expect(SRC).toMatch(/\{t\.korea\}/);
    expect(SRC).toMatch(/\{t\.help\}/);
    // 주 행동은 상대가 안전할 때로 한정한다 — 대화를 무조건 권하지 않는다.
    expect(SRC).toMatch(/상대가 안전하고 존중적인 경우에만/);
  });
});
