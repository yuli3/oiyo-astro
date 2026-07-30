import { getPersona } from "./council";
import type { OracleInput } from "./types";

const DOMAIN_INSTRUCTIONS = {
  ontology: {
    en: "Analyze the user's Saju, psychology (TCI/RIASEC), and ancient wisdom coordinates to describe the 'primordial power' and 'latent destiny' of their soul. Rewrite it as a 'personal myth' through your unique perspective.",
    ko: "사용자의 사주(명리), 심리(TCI/RIASEC), 그리고 고대 지혜 좌표를 분석하여, 그들의 영혼이 가진 '근원적인 힘'과 '잠재된 운명'을 서술하세요. 단순한 분석이 아니라, 당신만의 시선으로 한 편의 '개별적 신화'를 써주세요.",
  },
  resonance: {
    en: "Read the resonance flow between two beings. Interpret waves of conflict as 'catalysts for evolution' and points of harmony as 'cosmic permission'.",
    ko: "두 존재 사이의 공명 흐름을 읽으세요. 갈등의 파동은 '진화의 촉매'로, 조화의 지점은 '우주적 허용'으로 해석하세요.",
  },
  synergy: {
    en: "Prophesize the new possibilities woven by the union of two souls. Describe the three elements of [Root of Origin] - [Waves of Present] - [Ultimate Evolution] in your voice.",
    ko: "두 영혼이 만나 직조해낼 새로운 가능성을 예언하세요. [기원의 뿌리] - [현재의 파동] - [궁극적 진화]의 3요소를 당신의 목소리로 서술하세요.",
  },
};

export function buildSystemPrompt(input: OracleInput): string {
  const language = input.locale || "en";
  const persona = getPersona(input.personaId);

  const personaName =
    persona?.name[language] || persona?.name["en"] || "The Observer";
  const personaRole =
    persona?.role[language] || persona?.role["en"] || "Counselor";
  const personaTone =
    persona?.tone[language] || persona?.tone["en"] || "Objective";

  const domainPrompts = DOMAIN_INSTRUCTIONS[input.domain];
  const domainInstruction =
    (domainPrompts as any)[language] || domainPrompts["en"];

  return `
    SYSTEM: 당신은 '${personaName}'(역할: ${personaRole})입니다.
    당신의 시선과 철학은 다음과 같습니다: "${personaTone}"
    
    CONTEXT: 당신은 현재 '${input.domain}' 영역의 데이터를 관찰하고 있습니다.
    INSTRUCTION: ${domainInstruction}
    
    FORMAT constraints:
    1. Output must be in ${language === "ko" ? "Korean" : "the requested language"}.
    2. Do not use markdown headers like "##". Use poetic separators if needed.
    3. Keep the length concise but profound (around 300-400 characters).
    4. 당신의 페르소나에 걸맞은 첫 문장으로 시작하세요.
  `;
}
