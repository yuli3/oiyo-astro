'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type SolverStyle = "analytical" | "creative" | "practical" | "collaborative" | "strategic";

const data = {
  ko: {
    title: "문제 해결사 테스트: 나의 문제 해결 스타일은?",
    description: "15개의 질문으로 나만의 문제 해결 방식을 발견하세요.",
    questions: [
      { id: "q1", text: "새로운 문제를 만났을 때 먼저 데이터와 사실을 수집하고 분석한다.", type: "analytical" as SolverStyle },
      { id: "q2", text: "기존에 없던 독창적인 아이디어로 문제를 해결하는 것을 즐긴다.", type: "creative" as SolverStyle },
      { id: "q3", text: "복잡한 이론보다 바로 실행할 수 있는 현실적인 해결책을 선호한다.", type: "practical" as SolverStyle },
      { id: "q4", text: "팀원들과 함께 머리를 맞대고 해결책을 찾는 것이 효과적이다.", type: "collaborative" as SolverStyle },
      { id: "q5", text: "문제의 근본 원인을 파악하고 장기적인 해결책을 세우는 것이 중요하다.", type: "strategic" as SolverStyle },
      { id: "q6", text: "문제를 단계별로 쪼개서 논리적으로 접근하는 방식이 편하다.", type: "analytical" as SolverStyle },
      { id: "q7", text: "브레인스토밍처럼 자유로운 발상에서 최고의 해결책이 나온다고 생각한다.", type: "creative" as SolverStyle },
      { id: "q8", text: "즉시 시도해보고 결과를 보면서 수정하는 방식으로 문제를 해결한다.", type: "practical" as SolverStyle },
      { id: "q9", text: "다양한 관점을 가진 사람들의 의견을 모아 더 나은 답을 찾는다.", type: "collaborative" as SolverStyle },
      { id: "q10", text: "문제 해결 전에 전체적인 큰 그림과 목표를 먼저 설정한다.", type: "strategic" as SolverStyle },
      { id: "q11", text: "숫자와 패턴을 분석하면 대부분의 문제의 답이 보인다.", type: "analytical" as SolverStyle },
      { id: "q12", text: "남들이 생각하지 못한 방법으로 문제를 해결할 때 가장 뿌듯하다.", type: "creative" as SolverStyle },
      { id: "q13", text: "완벽한 계획보다 빠른 실행과 피드백이 더 중요하다.", type: "practical" as SolverStyle },
      { id: "q14", text: "혼자보다 팀이 함께할 때 더 창의적이고 좋은 결과가 나온다.", type: "collaborative" as SolverStyle },
      { id: "q15", text: "눈앞의 문제보다 이 문제가 미칠 영향과 파급 효과를 먼저 생각한다.", type: "strategic" as SolverStyle },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      analytical: { emoji: "🔬", title: "분석형 해결사 (Analytical Solver)", desc: "당신은 데이터와 논리로 문제를 해결하는 분석가입니다. 패턴을 발견하고 체계적으로 접근하는 능력이 뛰어납니다. 복잡한 문제를 단계별로 분해하여 근거 있는 솔루션을 도출합니다." },
      creative: { emoji: "💡", title: "창의형 해결사 (Creative Solver)", desc: "당신은 독창적인 아이디어로 문제를 해결하는 혁신가입니다. 기존의 틀을 벗어나 새로운 관점에서 접근하며, 예상치 못한 창의적 해결책을 만들어냅니다." },
      practical: { emoji: "🔧", title: "실용형 해결사 (Practical Solver)", desc: "당신은 즉각적인 행동과 실험으로 문제를 해결하는 실행가입니다. 이론보다 현장에서 배우고, 빠른 피드백을 통해 효율적으로 문제를 극복합니다." },
      collaborative: { emoji: "🤝", title: "협력형 해결사 (Collaborative Solver)", desc: "당신은 팀의 집단 지성을 활용하는 협력자입니다. 다양한 관점을 통합하고 사람들의 강점을 조화롭게 결합하여 더 나은 해결책을 만들어냅니다." },
      strategic: { emoji: "♟️", title: "전략형 해결사 (Strategic Solver)", desc: "당신은 큰 그림을 보고 장기적으로 접근하는 전략가입니다. 문제의 근본 원인과 파급 효과를 분석하여 지속 가능하고 종합적인 솔루션을 설계합니다." },
    },
    retake: "다시하기", resultLabel: "나의 문제 해결 스타일",
  },
  en: {
    title: "Problem Solver Test: What's Your Problem-Solving Style?",
    description: "Discover your unique problem-solving approach through 15 questions.",
    questions: [
      { id: "q1", text: "When I encounter a new problem, I first collect and analyze data and facts.", type: "analytical" as SolverStyle },
      { id: "q2", text: "I enjoy solving problems with original ideas that haven't been tried before.", type: "creative" as SolverStyle },
      { id: "q3", text: "I prefer realistic solutions I can act on immediately over complex theories.", type: "practical" as SolverStyle },
      { id: "q4", text: "Brainstorming with team members is the most effective way to find solutions.", type: "collaborative" as SolverStyle },
      { id: "q5", text: "It's important to identify the root cause and develop long-term solutions.", type: "strategic" as SolverStyle },
      { id: "q6", text: "Breaking down problems step by step and approaching them logically feels natural.", type: "analytical" as SolverStyle },
      { id: "q7", text: "I believe the best solutions come from free-flowing brainstorming sessions.", type: "creative" as SolverStyle },
      { id: "q8", text: "I solve problems by trying things immediately and adjusting based on results.", type: "practical" as SolverStyle },
      { id: "q9", text: "I find better answers by gathering perspectives from people with diverse viewpoints.", type: "collaborative" as SolverStyle },
      { id: "q10", text: "Before solving a problem, I set the overall big picture and goals first.", type: "strategic" as SolverStyle },
      { id: "q11", text: "Analyzing numbers and patterns reveals the answer to most problems.", type: "analytical" as SolverStyle },
      { id: "q12", text: "I feel most satisfied when solving problems in ways others haven't thought of.", type: "creative" as SolverStyle },
      { id: "q13", text: "Quick execution and feedback are more important than a perfect plan.", type: "practical" as SolverStyle },
      { id: "q14", text: "Teams produce more creative and better results than working alone.", type: "collaborative" as SolverStyle },
      { id: "q15", text: "Before the immediate problem, I think about its broader impact and ripple effects.", type: "strategic" as SolverStyle },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      analytical: { emoji: "🔬", title: "Analytical Solver", desc: "You solve problems with data and logic. You excel at identifying patterns and approaching systematically. You break down complex problems step by step to derive evidence-based solutions." },
      creative: { emoji: "💡", title: "Creative Solver", desc: "You're an innovator who solves problems with original ideas. You break from convention and approach from new angles, generating unexpected creative solutions." },
      practical: { emoji: "🔧", title: "Practical Solver", desc: "You're a doer who solves problems through immediate action and experimentation. You learn on the ground rather than in theory and overcome problems efficiently through quick feedback." },
      collaborative: { emoji: "🤝", title: "Collaborative Solver", desc: "You leverage the collective intelligence of a team. You integrate diverse perspectives and harmoniously combine people's strengths to create better solutions." },
      strategic: { emoji: "♟️", title: "Strategic Solver", desc: "You're a strategist who sees the big picture and takes a long-term approach. You analyze root causes and ripple effects to design sustainable and comprehensive solutions." },
    },
    retake: "Retake", resultLabel: "Your Problem-Solving Style",
  },
  ja: {
    title: "問題解決者テスト：あなたの問題解決スタイルは？",
    description: "15の質問であなただけの問題解決方法を発見しましょう。",
    questions: [
      { id: "q1", text: "新しい問題に出会ったとき、まずデータと事実を収集し分析する。", type: "analytical" as SolverStyle },
      { id: "q2", text: "今までにない独創的なアイデアで問題を解決するのを楽しむ。", type: "creative" as SolverStyle },
      { id: "q3", text: "複雑な理論よりすぐに実行できる現実的な解決策を好む。", type: "practical" as SolverStyle },
      { id: "q4", text: "チームメンバーと一緒に頭を突き合わせて解決策を探すのが効果的だ。", type: "collaborative" as SolverStyle },
      { id: "q5", text: "問題の根本原因を把握し、長期的な解決策を立てることが重要だ。", type: "strategic" as SolverStyle },
      { id: "q6", text: "問題を段階的に分けて論理的にアプローチする方法が心地よい。", type: "analytical" as SolverStyle },
      { id: "q7", text: "ブレインストーミングのような自由な発想から最高の解決策が生まれると思う。", type: "creative" as SolverStyle },
      { id: "q8", text: "すぐに試してみて結果を見ながら修正する方法で問題を解決する。", type: "practical" as SolverStyle },
      { id: "q9", text: "多様な視点を持つ人々の意見を集めて、より良い答えを見つける。", type: "collaborative" as SolverStyle },
      { id: "q10", text: "問題を解決する前に、まず全体的な大きな絵と目標を設定する。", type: "strategic" as SolverStyle },
      { id: "q11", text: "数字とパターンを分析すればほとんどの問題の答えが見える。", type: "analytical" as SolverStyle },
      { id: "q12", text: "他人が思いつかなかった方法で問題を解決したとき、最も誇らしく感じる。", type: "creative" as SolverStyle },
      { id: "q13", text: "完璧な計画よりも素早い実行とフィードバックの方が重要だ。", type: "practical" as SolverStyle },
      { id: "q14", text: "一人よりチームで取り組むときの方がより創造的で良い結果が出る。", type: "collaborative" as SolverStyle },
      { id: "q15", text: "目の前の問題よりも、この問題が及ぼす影響と波及効果を先に考える。", type: "strategic" as SolverStyle },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      analytical: { emoji: "🔬", title: "分析型解決者 (Analytical Solver)", desc: "あなたはデータと論理で問題を解決するアナリストです。パターンを発見し体系的にアプローチする能力に優れています。複雑な問題を段階的に分解して根拠のある解決策を導き出します。" },
      creative: { emoji: "💡", title: "創造型解決者 (Creative Solver)", desc: "あなたは独創的なアイデアで問題を解決するイノベーターです。既存の枠を超えて新しい視点からアプローチし、予想外の創造的な解決策を生み出します。" },
      practical: { emoji: "🔧", title: "実用型解決者 (Practical Solver)", desc: "あなたは即座の行動と実験で問題を解決する実行者です。理論よりも現場で学び、素早いフィードバックを通じて効率的に問題を克服します。" },
      collaborative: { emoji: "🤝", title: "協力型解決者 (Collaborative Solver)", desc: "あなたはチームの集合知を活用する協力者です。多様な視点を統合し、人々の強みを調和させてより良い解決策を生み出します。" },
      strategic: { emoji: "♟️", title: "戦略型解決者 (Strategic Solver)", desc: "あなたは大きな絵を見て長期的にアプローチする戦略家です。問題の根本原因と波及効果を分析し、持続可能で総合的な解決策を設計します。" },
    },
    retake: "もう一度", resultLabel: "あなたの問題解決スタイル",
  },
  zh: {
    title: "问题解决者测试：你的解决问题风格是什么？",
    description: "通过15个问题，发现你独特的解决问题方式。",
    questions: [
      { id: "q1", text: "遇到新问题时，我会先收集并分析数据和事实。", type: "analytical" as SolverStyle },
      { id: "q2", text: "我喜欢用前所未有的独创想法来解决问题。", type: "creative" as SolverStyle },
      { id: "q3", text: "比起复杂的理论，我更偏好能立即执行的现实解决方案。", type: "practical" as SolverStyle },
      { id: "q4", text: "和团队成员一起集思广益寻找解决方案更有效。", type: "collaborative" as SolverStyle },
      { id: "q5", text: "找出问题的根本原因并制定长期解决方案很重要。", type: "strategic" as SolverStyle },
      { id: "q6", text: "把问题逐步拆解、逻辑地处理让我感到自在。", type: "analytical" as SolverStyle },
      { id: "q7", text: "我认为最好的解决方案来自像头脑风暴那样自由的构思。", type: "creative" as SolverStyle },
      { id: "q8", text: "我通过立即尝试并根据结果调整的方式来解决问题。", type: "practical" as SolverStyle },
      { id: "q9", text: "我会收集不同视角的人的意见，找到更好的答案。", type: "collaborative" as SolverStyle },
      { id: "q10", text: "在解决问题之前，我会先设定整体大局和目标。", type: "strategic" as SolverStyle },
      { id: "q11", text: "分析数字和规律往往能看出大多数问题的答案。", type: "analytical" as SolverStyle },
      { id: "q12", text: "用别人想不到的方法解决问题时，我最有成就感。", type: "creative" as SolverStyle },
      { id: "q13", text: "比起完美的计划，快速执行和反馈更重要。", type: "practical" as SolverStyle },
      { id: "q14", text: "团队合作比独自一人能产出更有创意、更好的结果。", type: "collaborative" as SolverStyle },
      { id: "q15", text: "比起眼前的问题，我会先考虑这个问题的影响和连锁效应。", type: "strategic" as SolverStyle },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      analytical: { emoji: "🔬", title: "分析型解决者 (Analytical Solver)", desc: "你是用数据和逻辑解决问题的分析者。你擅长发现规律并系统化地处理问题，能把复杂问题逐步拆解，得出有依据的解决方案。" },
      creative: { emoji: "💡", title: "创意型解决者 (Creative Solver)", desc: "你是用独创想法解决问题的创新者。你打破常规、从新的角度切入，创造出意想不到的创意解决方案。" },
      practical: { emoji: "🔧", title: "实用型解决者 (Practical Solver)", desc: "你是靠即时行动和实验解决问题的行动派。你更倾向于在实践中学习，通过快速反馈高效地克服问题。" },
      collaborative: { emoji: "🤝", title: "协作型解决者 (Collaborative Solver)", desc: "你善于运用团队的集体智慧。你整合多元视角，将人们的优势和谐结合，创造出更好的解决方案。" },
      strategic: { emoji: "♟️", title: "战略型解决者 (Strategic Solver)", desc: "你是着眼大局、以长期视角处理问题的战略家。你分析问题的根本原因和连锁效应，设计出可持续且全面的解决方案。" },
    },
    retake: "重新测试", resultLabel: "你的解决问题风格",
  },
  fr: {
    title: "Test du résolveur de problèmes : quel est votre style de résolution de problèmes ?",
    description: "Découvrez votre approche unique de résolution de problèmes à travers 15 questions.",
    questions: [
      { id: "q1", text: "Face à un nouveau problème, je collecte et analyse d'abord les données et les faits.", type: "analytical" as SolverStyle },
      { id: "q2", text: "J'aime résoudre les problèmes avec des idées originales jamais essayées auparavant.", type: "creative" as SolverStyle },
      { id: "q3", text: "Je préfère des solutions réalistes que je peux appliquer immédiatement plutôt que des théories complexes.", type: "practical" as SolverStyle },
      { id: "q4", text: "Le brainstorming avec les membres de l'équipe est le moyen le plus efficace de trouver des solutions.", type: "collaborative" as SolverStyle },
      { id: "q5", text: "Il est important d'identifier la cause profonde et de développer des solutions à long terme.", type: "strategic" as SolverStyle },
      { id: "q6", text: "Décomposer les problèmes étape par étape et les aborder logiquement me vient naturellement.", type: "analytical" as SolverStyle },
      { id: "q7", text: "Je pense que les meilleures solutions viennent de sessions de brainstorming libres.", type: "creative" as SolverStyle },
      { id: "q8", text: "Je résous les problèmes en essayant immédiatement puis en ajustant selon les résultats.", type: "practical" as SolverStyle },
      { id: "q9", text: "Je trouve de meilleures réponses en rassemblant des points de vue variés.", type: "collaborative" as SolverStyle },
      { id: "q10", text: "Avant de résoudre un problème, je définis d'abord la vision d'ensemble et les objectifs.", type: "strategic" as SolverStyle },
      { id: "q11", text: "Analyser les chiffres et les tendances révèle la réponse à la plupart des problèmes.", type: "analytical" as SolverStyle },
      { id: "q12", text: "Je me sens le plus satisfait(e) en résolvant des problèmes d'une façon que d'autres n'ont pas envisagée.", type: "creative" as SolverStyle },
      { id: "q13", text: "Une exécution rapide et le retour d'expérience comptent plus qu'un plan parfait.", type: "practical" as SolverStyle },
      { id: "q14", text: "Les équipes produisent des résultats plus créatifs et meilleurs qu'en travaillant seul.", type: "collaborative" as SolverStyle },
      { id: "q15", text: "Avant le problème immédiat, je pense à son impact plus large et à ses répercussions.", type: "strategic" as SolverStyle },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      analytical: { emoji: "🔬", title: "Résolveur analytique (Analytical Solver)", desc: "Vous résolvez les problèmes avec des données et de la logique. Vous excellez à identifier des tendances et à aborder les choses de façon systématique. Vous décomposez les problèmes complexes étape par étape pour aboutir à des solutions fondées sur des preuves." },
      creative: { emoji: "💡", title: "Résolveur créatif (Creative Solver)", desc: "Vous êtes un(e) innovateur(rice) qui résout les problèmes avec des idées originales. Vous rompez avec les conventions et abordez les choses sous de nouveaux angles, générant des solutions créatives inattendues." },
      practical: { emoji: "🔧", title: "Résolveur pragmatique (Practical Solver)", desc: "Vous êtes une personne d'action qui résout les problèmes par l'action immédiate et l'expérimentation. Vous apprenez sur le terrain plutôt que dans la théorie et surmontez les problèmes efficacement grâce à un retour rapide." },
      collaborative: { emoji: "🤝", title: "Résolveur collaboratif (Collaborative Solver)", desc: "Vous exploitez l'intelligence collective d'une équipe. Vous intégrez des points de vue variés et combinez harmonieusement les forces de chacun pour créer de meilleures solutions." },
      strategic: { emoji: "♟️", title: "Résolveur stratégique (Strategic Solver)", desc: "Vous êtes un(e) stratège qui voit la vision d'ensemble et adopte une approche à long terme. Vous analysez les causes profondes et les répercussions pour concevoir des solutions durables et globales." },
    },
    retake: "Recommencer", resultLabel: "Votre style de résolution de problèmes",
  },
  es: {
    title: "Test del solucionador de problemas: ¿cuál es tu estilo para resolver problemas?",
    description: "Descubre tu enfoque único para resolver problemas a través de 15 preguntas.",
    questions: [
      { id: "q1", text: "Cuando me encuentro con un problema nuevo, primero recopilo y analizo datos y hechos.", type: "analytical" as SolverStyle },
      { id: "q2", text: "Disfruto resolviendo problemas con ideas originales que no se han probado antes.", type: "creative" as SolverStyle },
      { id: "q3", text: "Prefiero soluciones realistas que pueda aplicar de inmediato antes que teorías complejas.", type: "practical" as SolverStyle },
      { id: "q4", text: "Hacer una lluvia de ideas con el equipo es la forma más eficaz de encontrar soluciones.", type: "collaborative" as SolverStyle },
      { id: "q5", text: "Es importante identificar la causa raíz y desarrollar soluciones a largo plazo.", type: "strategic" as SolverStyle },
      { id: "q6", text: "Descomponer los problemas paso a paso y abordarlos con lógica me resulta natural.", type: "analytical" as SolverStyle },
      { id: "q7", text: "Creo que las mejores soluciones surgen de sesiones de lluvia de ideas libres.", type: "creative" as SolverStyle },
      { id: "q8", text: "Resuelvo problemas probando cosas de inmediato y ajustando según los resultados.", type: "practical" as SolverStyle },
      { id: "q9", text: "Encuentro mejores respuestas reuniendo perspectivas de personas con puntos de vista diversos.", type: "collaborative" as SolverStyle },
      { id: "q10", text: "Antes de resolver un problema, primero defino el panorama general y los objetivos.", type: "strategic" as SolverStyle },
      { id: "q11", text: "Analizar números y patrones revela la respuesta a la mayoría de los problemas.", type: "analytical" as SolverStyle },
      { id: "q12", text: "Me siento más satisfecho(a) al resolver problemas de formas que otros no han pensado.", type: "creative" as SolverStyle },
      { id: "q13", text: "La ejecución rápida y el feedback importan más que un plan perfecto.", type: "practical" as SolverStyle },
      { id: "q14", text: "Los equipos producen resultados más creativos y mejores que trabajar en solitario.", type: "collaborative" as SolverStyle },
      { id: "q15", text: "Antes del problema inmediato, pienso en su impacto más amplio y sus efectos colaterales.", type: "strategic" as SolverStyle },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      analytical: { emoji: "🔬", title: "Solucionador analítico (Analytical Solver)", desc: "Resuelves problemas con datos y lógica. Destacas identificando patrones y abordando las cosas de forma sistemática. Descompones problemas complejos paso a paso para llegar a soluciones basadas en evidencia." },
      creative: { emoji: "💡", title: "Solucionador creativo (Creative Solver)", desc: "Eres un(a) innovador(a) que resuelve problemas con ideas originales. Rompes con lo convencional y abordas las cosas desde nuevos ángulos, generando soluciones creativas inesperadas." },
      practical: { emoji: "🔧", title: "Solucionador práctico (Practical Solver)", desc: "Eres una persona de acción que resuelve problemas mediante la acción inmediata y la experimentación. Aprendes sobre la marcha en lugar de en la teoría y superas los problemas de forma eficiente gracias al feedback rápido." },
      collaborative: { emoji: "🤝", title: "Solucionador colaborativo (Collaborative Solver)", desc: "Aprovechas la inteligencia colectiva de un equipo. Integras perspectivas diversas y combinas armoniosamente las fortalezas de las personas para crear mejores soluciones." },
      strategic: { emoji: "♟️", title: "Solucionador estratégico (Strategic Solver)", desc: "Eres un(a) estratega que ve el panorama general y adopta un enfoque a largo plazo. Analizas causas raíz y efectos colaterales para diseñar soluciones sostenibles e integrales." },
    },
    retake: "Repetir", resultLabel: "Tu estilo para resolver problemas",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다." },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question." },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse." },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder." },
};

export default function ProblemSolverTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "problem-solver", title: "ProblemSolverTest", finished: phase === "result" });

  const types: SolverStyle[] = ["analytical", "creative", "practical", "collaborative", "strategic"];
  const scores = Object.fromEntries(types.map((s) => [s, 0])) as Record<SolverStyle, number>;
  t.questions.forEach((q) => { if (answers[q.id]) scores[q.type] += answers[q.id]; });
  const topType = (Object.entries(scores) as [SolverStyle, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topType];
    return (
      <div className="not-prose my-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
          <p className="text-slate-700 text-base leading-relaxed">{r.desc}</p>
        </div>
        <button onClick={() => { setAnswers({}); setPhase("quiz"); }} className="text-slate-400 text-sm hover:underline">{t.retake}</button>
        <ShareResultButton locale={lang} heading={t.title} resultTitle={r.title} emoji={r.emoji} />
      </div>
    );
  }

  return (
    <QuestionnaireMatrix
      title={t.title}
      description={t.description}
      questions={t.questions}
      options={t.options}
      answers={answers}
      completedLabel={ui.completed}
      unansweredLabel={ui.unanswered}
      submitLabel={ui.submit}
      validationLabel={ui.validation}
      onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
      onSubmit={() => setPhase("result")}
    />
  );
}
