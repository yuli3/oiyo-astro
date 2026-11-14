import type { OntologySignal } from "@/assessments";
import { weaveAssessmentSignals, type CareerValue, type WeaveEvidence, type WeaveLayer, type WeaveTheme } from "@/lib/ontology/assessment-weave";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

// 나의 지도 M4 (2026-09-28): 서로 다른 층이 같은 방향을 가리킬 때만 한 문단으로 엮는다.
// 점수를 합치지 않는다는 "검사로 본 나"의 원칙은 그대로 두고, 근거 좌표를 줄마다 밝힌다.
const COPY: Record<Lang, {
  heading: string;
  three: string;
  two: string;
  caveat: string;
  and: string;
  theme: Record<WeaveTheme, { name: string; gloss: string }>;
  layer: Record<WeaveLayer, string>;
  big5: Record<"O" | "C" | "E" | "A", string>;
  mbti: string;
  riasec: Record<"R" | "I" | "A" | "S" | "E" | "C", string>;
  topValue: string;
  value: Record<CareerValue, string>;
}> = {
  ko: {
    heading: "엮어 읽기",
    three: "성격·흥미·가치, 세 층이 모두 {theme} 쪽을 가리켜요. 서로 다른 것을 재는 검사들인데도 같은 방향이에요 — {gloss}.",
    two: "{layers} 두 층이 {theme} 쪽을 함께 가리켜요 — {gloss}.",
    caveat: "점수를 합친 결과가 아니에요. 같은 방향을 가리킨 좌표만 모아 보여 드려요.",
    and: "",
    theme: {
      drive: { name: "추진력", gloss: "일을 벌이고 앞장서는 힘" },
      connection: { name: "교감", gloss: "사람에게 맞추고 돕는 힘" },
      curiosity: { name: "탐구", gloss: "새로운 것을 파고드는 힘" },
      structure: { name: "체계", gloss: "질서를 세우고 끝까지 챙기는 힘" },
    },
    layer: { personality: "성격", interest: "흥미", values: "가치" },
    big5: { O: "개방성", C: "성실성", E: "외향성", A: "우호성" },
    mbti: "MBTI {pole} 쪽",
    riasec: { R: "현실형", I: "탐구형", A: "예술형", S: "사회형", E: "진취형", C: "관습형" },
    topValue: "직업가치 1순위",
    value: { security: "안정성", achievement: "성취", autonomy: "자율성", service: "기여", creativity: "창의성", status: "인정" },
  },
  en: {
    heading: "Reading them together",
    three: "Personality, interests and values all point toward {theme}. They measure different things, yet they lean the same way — {gloss}.",
    two: "Your {layers} both point toward {theme} — {gloss}.",
    caveat: "This is not a combined score. It only gathers the coordinates that point the same way.",
    and: " and ",
    theme: {
      drive: { name: "drive", gloss: "the pull to start things and lead" },
      connection: { name: "connection", gloss: "the pull to attune to and help people" },
      curiosity: { name: "curiosity", gloss: "the pull to dig into what is new" },
      structure: { name: "structure", gloss: "the pull to set order and see things through" },
    },
    layer: { personality: "personality", interest: "interests", values: "values" },
    big5: { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness" },
    mbti: "MBTI toward {pole}",
    riasec: { R: "Realistic", I: "Investigative", A: "Artistic", S: "Social", E: "Enterprising", C: "Conventional" },
    topValue: "Top work value",
    value: { security: "Security", achievement: "Achievement", autonomy: "Autonomy", service: "Contribution", creativity: "Creativity", status: "Recognition" },
  },
  ja: {
    heading: "重ねて読む",
    three: "性格・興味・価値の三つの層が、どれも{theme}の方を指しています。測るものが違う検査なのに同じ向きです — {gloss}。",
    two: "{layers}の二つの層が、そろって{theme}の方を指しています — {gloss}。",
    caveat: "点数を合計した結果ではありません。同じ向きを指した座標だけを集めて見せています。",
    and: "と",
    theme: {
      drive: { name: "推進力", gloss: "物事を始めて先頭に立つ力" },
      connection: { name: "共感", gloss: "人に合わせて支える力" },
      curiosity: { name: "探究", gloss: "新しいものを掘り下げる力" },
      structure: { name: "秩序", gloss: "筋道を立てて最後までやり抜く力" },
    },
    layer: { personality: "性格", interest: "興味", values: "価値" },
    big5: { O: "開放性", C: "誠実性", E: "外向性", A: "協調性" },
    mbti: "MBTI {pole}寄り",
    riasec: { R: "現実的", I: "研究的", A: "芸術的", S: "社会的", E: "企業的", C: "慣習的" },
    topValue: "仕事の価値観1位",
    value: { security: "安定性", achievement: "達成", autonomy: "自律性", service: "貢献", creativity: "創造性", status: "承認" },
  },
  zh: {
    heading: "合起来看",
    three: "性格、兴趣、价值三个层面都指向{theme}。它们测量的东西不同，方向却一致——{gloss}。",
    two: "{layers}两个层面一起指向{theme}——{gloss}。",
    caveat: "这不是合并后的分数，只是把指向同一方向的坐标放在一起。",
    and: "和",
    theme: {
      drive: { name: "行动力", gloss: "开局并带头的力量" },
      connection: { name: "共情", gloss: "体贴并帮助他人的力量" },
      curiosity: { name: "探索", gloss: "钻研新事物的力量" },
      structure: { name: "条理", gloss: "建立秩序并坚持到底的力量" },
    },
    layer: { personality: "性格", interest: "兴趣", values: "价值" },
    big5: { O: "开放性", C: "尽责性", E: "外向性", A: "宜人性" },
    mbti: "MBTI 偏{pole}",
    riasec: { R: "现实型", I: "研究型", A: "艺术型", S: "社会型", E: "企业型", C: "常规型" },
    topValue: "职业价值第一位",
    value: { security: "稳定", achievement: "成就", autonomy: "自主", service: "贡献", creativity: "创造", status: "认可" },
  },
  fr: {
    heading: "Lire ensemble",
    three: "Personnalité, intérêts et valeurs pointent tous vers {theme}. Ils mesurent des choses différentes, mais penchent du même côté — {gloss}.",
    two: "Vos {layers} pointent ensemble vers {theme} — {gloss}.",
    caveat: "Ce n’est pas un score combiné : on rassemble seulement les coordonnées qui vont dans le même sens.",
    and: " et ",
    theme: {
      drive: { name: "l’élan", gloss: "l’envie de lancer les choses et de mener" },
      connection: { name: "le lien", gloss: "l’envie de s’accorder aux autres et d’aider" },
      curiosity: { name: "la curiosité", gloss: "l’envie de creuser ce qui est nouveau" },
      structure: { name: "la structure", gloss: "l’envie de mettre de l’ordre et d’aller au bout" },
    },
    layer: { personality: "personnalité", interest: "intérêts", values: "valeurs" },
    big5: { O: "Ouverture", C: "Conscience", E: "Extraversion", A: "Agréabilité" },
    mbti: "MBTI côté {pole}",
    riasec: { R: "Réaliste", I: "Investigateur", A: "Artistique", S: "Social", E: "Entreprenant", C: "Conventionnel" },
    topValue: "Première valeur au travail",
    value: { security: "Sécurité", achievement: "Accomplissement", autonomy: "Autonomie", service: "Contribution", creativity: "Créativité", status: "Reconnaissance" },
  },
  es: {
    heading: "Leerlos juntos",
    three: "Personalidad, intereses y valores apuntan hacia {theme}. Miden cosas distintas y aun así se inclinan igual — {gloss}.",
    two: "Tus {layers} apuntan juntos hacia {theme} — {gloss}.",
    caveat: "No es una puntuación combinada: solo reúne las coordenadas que apuntan en la misma dirección.",
    and: " y ",
    theme: {
      drive: { name: "el impulso", gloss: "las ganas de empezar cosas y liderar" },
      connection: { name: "la conexión", gloss: "las ganas de sintonizar con otros y ayudar" },
      curiosity: { name: "la curiosidad", gloss: "las ganas de profundizar en lo nuevo" },
      structure: { name: "la estructura", gloss: "las ganas de poner orden y llegar hasta el final" },
    },
    layer: { personality: "personalidad", interest: "intereses", values: "valores" },
    big5: { O: "Apertura", C: "Responsabilidad", E: "Extraversión", A: "Amabilidad" },
    mbti: "MBTI hacia {pole}",
    riasec: { R: "Realista", I: "Investigador", A: "Artístico", S: "Social", E: "Emprendedor", C: "Convencional" },
    topValue: "Primer valor laboral",
    value: { security: "Seguridad", achievement: "Logro", autonomy: "Autonomía", service: "Contribución", creativity: "Creatividad", status: "Reconocimiento" },
  },
};

// "성격과 흥미"·"흥미와 가치" — 앞말 받침에 따라 과/와를 고른다.
function joinLayers(words: string[], lang: Lang, and: string): string {
  if (lang !== "ko") return words.join(and);
  return words.reduce((acc, word, i) => {
    if (i === 0) return word;
    const last = acc.charCodeAt(acc.length - 1);
    const batchim = last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
    return `${acc}${batchim ? "과" : "와"} ${word}`;
  }, "");
}

function evidenceLine(row: WeaveEvidence, t: (typeof COPY)["ko"]): string {
  const layer = t.layer[row.layer];
  if (row.source === "big5") return `${layer} · Big Five ${t.big5[row.dimension]} ${Math.round(row.value)}%`;
  if (row.source === "mbti") return `${layer} · ${t.mbti.replace("{pole}", row.pole)} ${Math.round(row.value)}%`;
  if (row.source === "riasec") return `${layer} · RIASEC ${t.riasec[row.code]} (${row.code})`;
  return `${layer} · ${t.topValue} ${t.value[row.value]}`;
}

export function AssessmentWeave({ signals, lang }: { signals: OntologySignal[]; lang: Lang }) {
  const t = COPY[lang];
  // 셋이 다 모인 방향이 있으면 그것만, 없으면 두 층이 겹친 방향 하나만 말한다 — 문단이 목록이 되지 않게.
  const readings = weaveAssessmentSignals(signals);
  const shown = readings[0]?.layers.length === 3 ? readings.filter((row) => row.layers.length === 3).slice(0, 2) : readings.slice(0, 1);
  if (shown.length === 0) return null;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4" data-testid="assessment-weave">
      <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.heading}</p>
      {shown.map((reading) => {
        const theme = t.theme[reading.theme];
        const sentence = (reading.layers.length === 3 ? t.three : t.two)
          .replace("{theme}", theme.name)
          .replace("{gloss}", theme.gloss)
          .replace("{layers}", joinLayers(reading.layers.map((layer) => t.layer[layer]), lang, t.and));
        return (
          <div key={reading.theme} className="mt-2">
            <p className="text-sm font-bold leading-6 text-foreground">{sentence}</p>
            <ul className="mt-2 space-y-1">
              {reading.evidence.map((row, index) => (
                <li key={index} className="text-[11px] font-bold text-green-800">· {evidenceLine(row, t)}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{t.caveat}</p>
    </div>
  );
}
