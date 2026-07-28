import { useEffect, useMemo, useState } from "react";

import {
  ATTACHMENT_INSTRUMENT,
  attachmentPlugin,
  attachmentResponsesFromAnswers,
  buildAttachmentResult,
  listAssessmentResults,
  recordAssessmentResult,
  type AttachmentDimension,
} from "@/assessments";
import { gaEvent } from "@/lib/analytics/ga-event";
import { recordTestResult } from "@/lib/user/test-results";
import RelatedReading from "../shared/RelatedReading";
import ResultNextSteps from "../shared/ResultNextSteps";

type Locale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LOCALES: Locale[] = ["ko", "en", "ja", "zh", "fr", "es"];

export const QUESTION_COPY: Record<Locale, string[]> = {
  ko: [
    "가까운 사람과의 계획이 갑자기 바뀌면 그 의미를 찾으려고 대화를 되짚어본다.", "다툰 뒤 말이 없는 동안 멀어지는 신호가 있는지 자꾸 살핀다.", "관계가 어떤 상태인지 분명해질 때까지 다른 일에 집중하기 어렵다.", "상대의 말투가 조금 달라져도 그날 기분에 오래 영향을 받는다.", "연락이 늦을 때 한 가지 결론을 내리기 전에 여러 가능성을 생각할 수 있다.", "관계의 불확실함을 당장 해결하지 않아도 한동안 일상을 이어갈 수 있다.",
    "감정적인 대화가 깊어지면 사실이나 일정 같은 실용적인 이야기로 옮기는 편이다.", "서운했던 일은 감정이 가라앉거나 때를 놓칠 때까지 말하기를 미룬다.", "돌봄을 받은 뒤에도 감정에 머무르기보다 곧 실용적인 일로 돌아가는 편이다.", "함께 조율하면 도움이 될 때도 내 일정과 결정을 따로 유지하려 한다.", "가까운 사람이 내 행동의 영향을 말할 때 자리를 피하지 않고 들을 수 있다.", "감정 대화에서 서둘러 해결하거나 끝내지 않고 서로의 말을 주고받을 수 있다.",
  ],
  en: [
    "When plans with someone close change unexpectedly, I replay the exchange to work out what it meant.", "During silence after a disagreement, my attention keeps returning to possible signs of distance.", "I find it hard to focus on other things until I know where the relationship stands.", "A small change in someone's tone can affect my mood for much of the day.", "When contact is delayed, I can consider several explanations before settling on one meaning.", "I can let relationship uncertainty remain unresolved for a while without it taking over my day.",
    "When a conversation becomes emotionally intense, I tend to shift toward facts, plans, or logistics.", "I postpone talking about hurt until the feeling fades or the moment has passed.", "After receiving care, I tend to return quickly to practical matters rather than stay with the emotional exchange.", "I keep my routines and decisions separate even when coordinating might help.", "I can stay present when someone close explains how my actions affected them.", "I can make room for a two-way emotional conversation without rushing to solve or end it.",
  ],
  ja: [
    "親しい人との予定が急に変わると、その意味を考えてやり取りを振り返る。", "意見の衝突後に沈黙が続くと、距離が生まれた兆しを探し続ける。", "関係の状態がはっきりするまで他のことに集中しにくい。", "相手の口調の小さな変化が、その日の気分に長く影響する。", "連絡が遅いとき、一つの意味に決める前に複数の可能性を考えられる。", "関係の不確かさをすぐ解決しなくても、しばらく日常を続けられる。",
    "感情的な会話が深まると、事実や予定の話へ移りやすい。", "傷ついたことを話すのを、感情が薄れるか機会を逃すまで先延ばしにする。", "気遣いを受けても、感情のやり取りに留まらず実務的なことへ戻りやすい。", "調整が役立つ場面でも、予定や決定を別々に保とうとする。", "親しい人が自分の行動の影響を話すとき、その場に留まって聞ける。", "急いで解決したり終えたりせず、感情について互いに話す時間を持てる。",
  ],
  zh: [
    "与亲近之人的计划突然改变时，我会反复回想交流，试图弄清含义。", "争执后的沉默期间，我的注意力会不断回到可能疏远的迹象。", "在关系状态明确之前，我很难专注于其他事情。", "对方语气的一点变化，可能影响我大半天的心情。", "联系延迟时，我能先考虑多种解释，而不是立刻下结论。", "关系中的不确定暂时没有答案时，我仍能继续日常生活。",
    "谈话变得情绪强烈时，我往往转向事实、计划或事务。", "我会把受伤的感受推迟到情绪淡去或时机错过后再谈。", "得到关心后，我常很快回到实际事务，而不继续停留在情感交流中。", "即使协调会有帮助，我也倾向把自己的安排和决定分开。", "亲近的人说明我的行为如何影响他们时，我能留在当下倾听。", "我能进行双向的情感对话，而不急着解决或结束它。",
  ],
  fr: [
    "Quand un projet avec un proche change soudainement, je repasse l’échange pour en comprendre le sens.", "Pendant le silence après un désaccord, mon attention revient aux signes possibles de distance.", "J’ai du mal à me concentrer ailleurs tant que la situation de la relation n’est pas claire.", "Un petit changement de ton peut influencer mon humeur pendant une grande partie de la journée.", "Quand un contact tarde, je peux envisager plusieurs explications avant de conclure.", "Je peux laisser une incertitude relationnelle sans réponse quelque temps sans qu’elle occupe toute ma journée.",
    "Quand une conversation devient très émotionnelle, je me tourne vers les faits, les plans ou la logistique.", "Je reporte une discussion sur une blessure jusqu’à ce que l’émotion baisse ou que le moment passe.", "Après avoir reçu de l’attention, je reviens vite au pratique plutôt que de rester dans l’échange émotionnel.", "Je garde mes routines et décisions séparées même lorsqu’une coordination pourrait aider.", "Je peux rester présent·e lorsqu’un proche explique l’effet de mes actes sur lui ou elle.", "Je peux laisser place à un échange émotionnel réciproque sans chercher à le résoudre ou l’écourter.",
  ],
  es: [
    "Cuando un plan con alguien cercano cambia de repente, repaso la conversación para entender qué significa.", "Durante el silencio tras un desacuerdo, mi atención vuelve a posibles señales de distancia.", "Me cuesta concentrarme en otras cosas hasta saber en qué punto está la relación.", "Un pequeño cambio de tono puede afectar mi ánimo durante buena parte del día.", "Si el contacto tarda, puedo considerar varias explicaciones antes de decidir qué significa.", "Puedo dejar una incertidumbre relacional sin resolver por un tiempo sin que ocupe todo mi día.",
    "Cuando una conversación se vuelve muy emocional, tiendo a pasar a hechos, planes o asuntos prácticos.", "Pospongo hablar de algo que me dolió hasta que baja la emoción o pasa el momento.", "Después de recibir cuidado, vuelvo pronto a lo práctico en vez de quedarme en el intercambio emocional.", "Mantengo separadas mis rutinas y decisiones incluso cuando coordinarnos podría ayudar.", "Puedo permanecer presente cuando alguien cercano explica cómo le afectaron mis acciones.", "Puedo dar espacio a una conversación emocional de ida y vuelta sin apresurarme a resolverla o terminarla.",
  ],
};

export const COPY: Record<Locale, {
  title: string; subtitle: string; context: string; safety: string; question: (n: number) => string;
  scale: string[]; anxiety: string; avoidance: string; result: string; basis: string; observed: string;
  level: Record<"low" | "medium" | "high", string>; descriptions: Record<AttachmentDimension, Record<"low" | "medium" | "high", string>>;
  next: string; retake: string; restart: string; legacy: string; helpTitle: string; help: string; korea: string;
}> = {
  ko: { title: "성인 애착 경향 검사", subtitle: "불안과 회피를 두 개의 연속축으로 살펴봅니다", context: "최근의 중요한 가까운 관계를 떠올려 답해 주세요. 관계에 따라 결과가 달라질 수 있으며, 불편하면 언제든 중단할 수 있습니다.", safety: "자기이해용이며 임상 진단이 아닙니다. 관계의 안전성·학대 여부를 판별하지 않으며, 높은 점수는 누구의 잘못도 뜻하지 않습니다.", question: (n) => `${n} / 12`, scale: ["전혀 아니다", "아닌 편이다", "보통이다", "그런 편이다", "매우 그렇다"], anxiety: "애착 불안 경향", avoidance: "애착 회피 경향", result: "이번 응답에서 본 관계 경향", basis: "근거: 애착의 불안·회피 차원을 참고한 OIYO 자체 문항", observed: "백분위나 정확도가 아닌 응답척도상 위치", level: { low: "낮은 편", medium: "중간", high: "높은 편" }, descriptions: { anxiety: { low: "거리감이 생겨도 관계가 이어질 수 있다는 감각을 비교적 유지합니다.", medium: "상황에 따라 안심과 걱정이 함께 활성화될 수 있습니다.", high: "거리감이나 거절 가능성에 대한 걱정이 더 쉽게 활성화될 수 있습니다." }, avoidance: { low: "필요할 때 의지하거나 취약한 감정을 나누는 일이 비교적 편합니다.", medium: "가까움과 독립성 사이에서 상황에 따라 거리를 조절합니다.", high: "의존하거나 취약성을 나누는 상황에서 거리를 두려는 경향이 나타날 수 있습니다." } }, next: "상대가 안전하고 존중적인 경우에만, 감정을 가라앉힌 뒤 작은 요청과 경계를 말해 보세요.", retake: "즉시 반복하기보다 4–8주 뒤 또는 관계 맥락이 안정적으로 달라졌을 때 다시 살펴보세요.", restart: "다시 답하기", legacy: "이 링크는 과거 4유형 결과를 담고 있습니다. 현재 버전은 고정 유형 대신 불안·회피 두 축을 측정합니다.", helpTitle: "관계가 안전하지 않다면", help: "폭력·통제·위협은 애착 유형의 문제가 아닙니다. 안전을 우선하고 신뢰할 수 있는 사람이나 전문기관에 도움을 요청하세요.", korea: "한국: 즉각 위험 112·119 · 여성긴급전화 1366(24시간) · 자살예방상담 109" },
  en: { title: "Adult Attachment Tendencies", subtitle: "Explore anxiety and avoidance as two continuous dimensions", context: "Think of a recent important close relationship. Results can differ by relationship, and you may stop whenever the questions feel uncomfortable.", safety: "For self-understanding, not clinical diagnosis. It does not assess relationship safety or abuse, and a higher score is not anyone’s fault.", question: (n) => `${n} / 12`, scale: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"], anxiety: "Attachment anxiety tendency", avoidance: "Attachment avoidance tendency", result: "Relationship tendencies in this response", basis: "Evidence: OIYO-authored items informed by dimensional attachment research", observed: "Position on this response scale—not a percentile or accuracy score", level: { low: "lower", medium: "middle", high: "higher" }, descriptions: { anxiety: { low: "You can often retain a sense that the relationship continues through distance.", medium: "Reassurance and worry may both become active depending on context.", high: "Worry about distance or possible rejection may become active more easily." }, avoidance: { low: "Depending on someone and sharing vulnerability may feel relatively comfortable.", medium: "You adjust distance between closeness and independence depending on context.", high: "You may be more inclined to create distance around dependence or vulnerability." } }, next: "Only when the other person is safe and respectful, settle first and then express one small request or boundary.", retake: "Rather than repeating immediately, revisit in 4–8 weeks or after the relationship context has changed consistently.", restart: "Answer again", legacy: "This link contains a result from the former four-type version. The current version measures anxiety and avoidance dimensions instead of assigning a fixed type.", helpTitle: "If the relationship is not safe", help: "Violence, control, or threats are not attachment-style problems. Prioritize safety and contact a trusted person or local support service.", korea: "In Korea: immediate danger 112/119 · Women’s Emergency Hotline 1366 · Suicide Prevention Hotline 109. Elsewhere, use local emergency services." },
  ja: { title: "成人の愛着傾向チェック", subtitle: "不安と回避を二つの連続軸で見ます", context: "最近の大切な親しい関係を思い浮かべてください。関係によって結果は変わり、不快ならいつでも中止できます。", safety: "自己理解のためのもので臨床診断ではありません。関係の安全性や虐待を判定せず、高い点数は誰かの責任を意味しません。", question: (n) => `${n} / 12`, scale: ["全く違う", "違う", "どちらでもない", "そう思う", "強くそう思う"], anxiety: "愛着不安の傾向", avoidance: "愛着回避の傾向", result: "今回の回答に見られる関係傾向", basis: "根拠：愛着の不安・回避次元を参考にしたOIYO独自項目", observed: "百分位や正確度ではなく回答尺度上の位置", level: { low: "低め", medium: "中間", high: "高め" }, descriptions: { anxiety: { low: "距離があっても関係が続く感覚を比較的保てます。", medium: "状況により安心と心配の両方が動くことがあります。", high: "距離や拒絶の可能性への心配が動きやすい傾向があります。" }, avoidance: { low: "必要なとき頼ったり弱さを共有したりすることが比較的楽です。", medium: "親密さと自立の間で状況に応じて距離を調整します。", high: "依存や弱さの共有で距離を置く傾向が出ることがあります。" } }, next: "相手が安全で尊重的な場合に限り、落ち着いてから小さな願いか境界を伝えてください。", retake: "すぐ繰り返さず、4〜8週間後か関係状況が安定して変わった時に見直してください。", restart: "もう一度答える", legacy: "このリンクは旧4タイプ版の結果です。現行版は固定タイプではなく不安・回避の二軸を測ります。", helpTitle: "関係が安全でないなら", help: "暴力・支配・脅迫は愛着タイプの問題ではありません。安全を優先し、信頼できる人や地域の支援窓口に連絡してください。", korea: "韓国：緊急112・119／女性緊急電話1366／自殺予防相談109。海外では地域の緊急窓口へ。" },
  zh: { title: "成人依恋倾向测验", subtitle: "以焦虑和回避两个连续维度进行观察", context: "请想起近期一段重要的亲密关系。不同关系中的结果可能不同，如感到不适可随时停止。", safety: "仅用于自我理解，不是临床诊断。本测验不判断关系安全或虐待，较高分数也不代表任何人的过错。", question: (n) => `${n} / 12`, scale: ["完全不同意", "不同意", "一般", "同意", "非常同意"], anxiety: "依恋焦虑倾向", avoidance: "依恋回避倾向", result: "本次回答呈现的关系倾向", basis: "依据：参考依恋焦虑与回避维度的OIYO原创题目", observed: "这是回答量表上的位置，不是百分位或准确率", level: { low: "较低", medium: "中间", high: "较高" }, descriptions: { anxiety: { low: "即使出现距离，你通常也能保持关系仍会继续的感受。", medium: "安心与担忧可能会随情境同时出现。", high: "对距离或可能被拒绝的担忧可能更容易被激活。" }, avoidance: { low: "需要时依靠他人或分享脆弱感受相对较自在。", medium: "会根据情境在亲近和独立之间调节距离。", high: "在依赖或分享脆弱时，可能更倾向保持距离。" } }, next: "仅在对方安全且尊重你的情况下，先让自己平静，再表达一个小请求或界限。", retake: "不要立即反复测验，建议4–8周后或关系情境持续改变后再观察。", restart: "重新作答", legacy: "此链接包含旧版四类型结果。当前版本不固定分类，而是测量焦虑与回避两个维度。", helpTitle: "如果关系并不安全", help: "暴力、控制或威胁不是依恋类型问题。请优先确保安全，并联系可信赖的人或当地支持机构。", korea: "韩国：紧急危险112/119 · 女性紧急热线1366 · 自杀预防热线109。其他地区请联系当地紧急服务。" },
  fr: { title: "Tendances d’attachement adulte", subtitle: "Explorez l’anxiété et l’évitement sur deux dimensions continues", context: "Pensez à une relation proche et importante récente. Le résultat peut varier selon la relation; vous pouvez arrêter à tout moment.", safety: "Pour la compréhension de soi, sans valeur diagnostique. Ce test n’évalue ni la sécurité ni la violence relationnelle; un score élevé n’est la faute de personne.", question: (n) => `${n} / 12`, scale: ["Pas du tout d’accord", "Pas d’accord", "Neutre", "D’accord", "Tout à fait d’accord"], anxiety: "Tendance à l’anxiété d’attachement", avoidance: "Tendance à l’évitement d’attachement", result: "Tendances relationnelles dans cette réponse", basis: "Base : items originaux OIYO inspirés du modèle dimensionnel", observed: "Position sur cette échelle, pas un percentile ni une précision", level: { low: "plus basse", medium: "intermédiaire", high: "plus élevée" }, descriptions: { anxiety: { low: "Vous gardez souvent le sentiment que le lien continue malgré la distance.", medium: "Réassurance et inquiétude peuvent s’activer selon le contexte.", high: "L’inquiétude face à la distance ou au rejet peut s’activer plus facilement." }, avoidance: { low: "Dépendre d’un proche et partager sa vulnérabilité peut être assez confortable.", medium: "Vous ajustez la distance entre proximité et indépendance selon le contexte.", high: "Vous pouvez davantage prendre de la distance face à la dépendance ou à la vulnérabilité." } }, next: "Seulement si l’autre est sûr et respectueux, apaisez-vous puis exprimez une petite demande ou limite.", retake: "Évitez de recommencer immédiatement; revenez dans 4–8 semaines ou après un changement relationnel stable.", restart: "Répondre à nouveau", legacy: "Ce lien contient un ancien résultat à quatre types. La version actuelle mesure deux dimensions sans attribuer de type fixe.", helpTitle: "Si la relation n’est pas sûre", help: "Violence, contrôle ou menaces ne sont pas des problèmes de style d’attachement. Priorisez votre sécurité et contactez une personne ou un service local de confiance.", korea: "En Corée : urgence 112/119 · ligne 1366 · prévention du suicide 109. Ailleurs, contactez les services locaux." },
  es: { title: "Tendencias de apego adulto", subtitle: "Explora ansiedad y evitación en dos dimensiones continuas", context: "Piensa en una relación cercana e importante reciente. El resultado puede variar según la relación y puedes detenerte cuando quieras.", safety: "Para autoconocimiento, no como diagnóstico. No evalúa seguridad ni abuso, y una puntuación alta no es culpa de nadie.", question: (n) => `${n} / 12`, scale: ["Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"], anxiety: "Tendencia de ansiedad de apego", avoidance: "Tendencia de evitación de apego", result: "Tendencias relacionales en esta respuesta", basis: "Base: ítems originales de OIYO inspirados en el modelo dimensional", observed: "Posición en esta escala, no percentil ni precisión", level: { low: "más baja", medium: "intermedia", high: "más alta" }, descriptions: { anxiety: { low: "Sueles conservar la sensación de que el vínculo continúa pese a la distancia.", medium: "La calma y la preocupación pueden activarse según el contexto.", high: "La preocupación por la distancia o el rechazo puede activarse con mayor facilidad." }, avoidance: { low: "Apoyarte en alguien y compartir vulnerabilidad puede resultarte relativamente cómodo.", medium: "Ajustas la distancia entre cercanía e independencia según el contexto.", high: "Puedes tender a tomar distancia ante la dependencia o la vulnerabilidad." } }, next: "Solo si la otra persona es segura y respetuosa, cálmate primero y expresa una petición o límite pequeño.", retake: "No repitas de inmediato; vuelve en 4–8 semanas o tras un cambio estable del contexto relacional.", restart: "Responder de nuevo", legacy: "Este enlace contiene un resultado de la antigua versión de cuatro tipos. La versión actual mide dos dimensiones sin asignar un tipo fijo.", helpTitle: "Si la relación no es segura", help: "La violencia, el control o las amenazas no son problemas de estilo de apego. Prioriza tu seguridad y contacta a una persona o servicio local de confianza.", korea: "En Corea: peligro inmediato 112/119 · línea 1366 · prevención del suicidio 109. En otros países, usa servicios locales." },
};

const DRAFT_BASIS: Record<Locale, string> = {
  ko: "검토 전 OIYO 성찰 문항입니다. 정식 심리척도나 ECR 계열 검사가 아닙니다.",
  en: "Draft OIYO reflection prompts; not a validated scale or ECR-family instrument.",
  ja: "検討前のOIYO内省項目です。検証済み尺度やECR系検査ではありません。",
  zh: "这是待审查的OIYO反思题目，不是经验证量表或ECR系列测验。",
  fr: "Questions de réflexion OIYO à l’état de brouillon, non validées et distinctes des instruments ECR.",
  es: "Preguntas de reflexión OIYO en borrador; no son una escala validada ni un instrumento ECR.",
};

const RESPONSE_POSITION: Record<Locale, string> = {
  ko: "검토 전 문항의 평균 응답 위치이며 백분위·검증 경계·정확도가 아닙니다.",
  en: "Mean response position on draft items—not a percentile, validated cutoff, or accuracy score.",
  ja: "検討前項目の平均回答位置であり、百分位・検証済み境界・正確度ではありません。",
  zh: "这是草案题目的平均作答位置，不是百分位、验证界限或准确率。",
  fr: "Position moyenne sur des items provisoires, sans percentile, seuil validé ni score de précision.",
  es: "Posición media en ítems provisionales; no es percentil, umbral validado ni puntuación de precisión.",
};

interface Props { locale?: string }
interface ResultState { anxiety: number; avoidance: number; observedAt: string }

export default function AttachmentStyleTest({ locale: rawLocale = "ko" }: Props) {
  const locale = (LOCALES.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const t = COPY[locale];
  const questions = QUESTION_COPY[locale];
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const legacyType = useMemo(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("type"), []);

  useEffect(() => {
    if (legacyType) window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
  }, [legacyType]);

  function answer(value: number) {
    if (answers.length === 0) {
      gaEvent("test_started", { test_id: "adult_attachment", instrument_version: ATTACHMENT_INSTRUMENT.version });
    }
    const next = [...answers, value];
    setAnswers(next);
    if (next.length !== ATTACHMENT_INSTRUMENT.items.length) return;

    const responses = attachmentResponsesFromAnswers(next);
    const isRetake = listAssessmentResults().some((item) => item.assessmentId === attachmentPlugin.id);
    const canonical = buildAttachmentResult(responses, { locale, sourcePath: `/${locale}/attachment-style/test` });
    recordAssessmentResult({ ...canonical, responses: {} });
    const scores = canonical.scores.normalized;
    recordTestResult({
      kind: "psychometric",
      testId: "attachment",
      title: t.title,
      resultLabel: `${t.anxiety} / ${t.avoidance}`,
      result: { anxiety: scores.anxiety, avoidance: scores.avoidance, scoreScale: "normalized-0-100" },
      locale,
      sourcePath: `/${locale}/attachment-style/test`,
    });
    gaEvent("test_completed", {
      test_id: "adult_attachment",
      instrument_version: ATTACHMENT_INSTRUMENT.version,
      is_retake: String(isRetake),
    });
    setResult({ anxiety: scores.anxiety, avoidance: scores.avoidance, observedAt: canonical.completedAt });
  }

  function restart() {
    setAnswers([]);
    setResult(null);
  }

  if (!result) {
    const current = answers.length;
    return <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </header>
      {legacyType && <p className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-900">{t.legacy}</p>}
      <p className="rounded-xl border bg-card p-4 text-sm leading-6 text-muted-foreground">{t.context}</p>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t.safety}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground"><span>{t.question(current + 1)}</span><span>{Math.round((current / 12) * 100)}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-green-600 transition-all" style={{ width: `${(current / 12) * 100}%` }} /></div>
      </div>
      <div className="rounded-xl border bg-card p-6 text-center"><p className="text-lg font-medium">{questions[current]}</p></div>
      <div className="grid gap-2 sm:grid-cols-5">
        {t.scale.map((label, index) => <button key={label} onClick={() => answer(index + 1)} className="rounded-lg border bg-card px-3 py-3 text-sm transition-colors hover:border-green-400 hover:bg-green-50"><span className="block font-bold text-green-700">{index + 1}</span><span className="mt-1 block text-xs text-muted-foreground">{label}</span></button>)}
      </div>
    </div>;
  }

  const dimensions: { id: AttachmentDimension; label: string; value: number }[] = [
    { id: "anxiety", label: t.anxiety, value: result.anxiety },
    { id: "avoidance", label: t.avoidance, value: result.avoidance },
  ];
  return <div className="space-y-6">
    <header className="space-y-2 text-center"><p className="text-sm text-muted-foreground">{t.result}</p><h1 className="text-2xl font-bold">{t.title}</h1></header>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t.safety}</p>
    <div className="grid gap-4 md:grid-cols-2">
      {dimensions.map(({ id, label, value }) => {
        const responseMean = (1 + (value * 4) / 100).toFixed(1);
        return <article key={id} className="rounded-2xl border bg-card p-5">
          <h2 className="font-bold">{label}</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-600" style={{ width: `${value}%` }} /></div>
          <p className="mt-2 text-right text-sm font-bold text-green-800">{responseMean} / 5.0</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{RESPONSE_POSITION[locale]}</p>
        </article>;
      })}
    </div>
    <div className="rounded-xl border bg-card p-4 text-xs leading-6 text-muted-foreground"><p>{RESPONSE_POSITION[locale]}</p><p>{DRAFT_BASIS[locale]}</p><p>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(result.observedAt))} · {ATTACHMENT_INSTRUMENT.version}</p></div>
    <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-950"><p>{t.next}</p><p className="mt-2">{t.retake}</p></div>
    <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-950">{t.korea}</p>
    <details className="rounded-xl border border-rose-200 bg-rose-50 p-4"><summary className="cursor-pointer font-bold text-rose-950">{t.helpTitle}</summary><p className="mt-3 text-sm leading-6 text-rose-900">{t.help}</p></details>
    <ResultNextSteps locale={locale} links={[
      { href: `/${locale}/love-language/test`, label: locale === "ko" ? "사랑의 언어 살펴보기" : "Love language reflection" },
      { href: `/${locale}/personal-boundaries-test`, label: locale === "ko" ? "관계 경계 살펴보기" : "Personal boundaries reflection" },
    ]} />
    <RelatedReading locale={locale} topic="attachment" />
    <button onClick={restart} className="w-full rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent">{t.restart}</button>
  </div>;
}
