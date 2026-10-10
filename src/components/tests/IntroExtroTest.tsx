import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from "../shared/ShareResultButton";
import { Questionnaire } from "@/components/ui/questionnaire";
import { introvertResultCopy } from "@/lib/introvert-result-copy";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
interface Props { locale?: string; }

type Spectrum = "deep_introvert" | "introvert" | "ambivert" | "extrovert" | "deep_extrovert";

interface Question { ko: string; en: string; ja: string; zh: string; fr: string; es: string; }

// Higher score = more extroverted
const questions: Question[] = [
  { ko: "사람들과 오래 어울리고 나면 에너지가 충전되는 느낌이 든다.", en: "After spending time with people, I feel energized.", ja: "人々と長く交流した後、エネルギーが充電される感じがする。", zh: "和人相处一段时间后，我会感觉能量被充满。", fr: "Après avoir passé du temps avec des gens, je me sens plein d'énergie.", es: "Después de pasar tiempo con otras personas, me siento con más energía." },
  { ko: "나는 파티나 모임에서 새로운 사람들을 만나는 것을 즐긴다.", en: "I enjoy meeting new people at parties or gatherings.", ja: "パーティーや集まりで新しい人々に会うことを楽しむ。", zh: "我喜欢在派对或聚会中认识新朋友。", fr: "J'aime rencontrer de nouvelles personnes lors de fêtes ou de rassemblements.", es: "Disfruto conocer gente nueva en fiestas o reuniones." },
  { ko: "혼자 있는 시간보다 사람들과 함께하는 시간을 더 선호한다.", en: "I prefer spending time with others over being alone.", ja: "一人でいる時間より人々と一緒にいる時間を好む。", zh: "相比独处，我更喜欢和别人一起度过时间。", fr: "Je préfère passer du temps avec les autres plutôt que rester seul.", es: "Prefiero pasar tiempo con otras personas antes que estar solo." },
  { ko: "처음 보는 사람에게 먼저 말을 거는 편이다.", en: "I tend to initiate conversations with people I've just met.", ja: "初対面の人に自分から話しかける方だ。", zh: "我通常会主动和刚认识的人搭话。", fr: "J'ai tendance à engager la conversation avec les personnes que je viens de rencontrer.", es: "Suelo iniciar conversaciones con personas que acabo de conocer." },
  { ko: "나는 여러 사람 앞에서 발표하거나 이야기하는 것이 불편하지 않다.", en: "I don't feel uncomfortable speaking or presenting in front of a group.", ja: "大勢の前でプレゼンや話をすることに不快を感じない。", zh: "在多人面前发言或做展示时，我不会觉得不自在。", fr: "Je ne suis pas mal à l'aise quand je parle ou présente devant un groupe.", es: "No me incomoda hablar o presentar frente a un grupo." },
  { ko: "일이나 공부를 할 때 배경음악이나 약간의 소음이 있는 환경을 선호한다.", en: "For work or study, I prefer environments with background music or some noise.", ja: "仕事や勉強では、BGMや少し騒音がある環境を好む。", zh: "工作或学习时，我更喜欢有背景音乐或一点声音的环境。", fr: "Pour travailler ou étudier, je préfère les environnements avec de la musique de fond ou un peu de bruit.", es: "Para trabajar o estudiar, prefiero ambientes con música de fondo o algo de ruido." },
  { ko: "생각을 글로 적기보다는 말로 먼저 표현하는 것이 더 자연스럽다.", en: "It feels more natural to express thoughts verbally first rather than in writing.", ja: "考えを文字に書くより、まず言葉で表現する方が自然だ。", zh: "相比先写下来，我更自然地先用语言表达想法。", fr: "Il m'est plus naturel d'exprimer mes pensées à l'oral avant de les écrire.", es: "Me resulta más natural expresar mis ideas hablando primero que por escrito." },
  { ko: "여러 활동과 사람들 속에 있을 때 삶이 더 활기차고 의미 있다고 느낀다.", en: "Life feels more vibrant and meaningful when surrounded by many activities and people.", ja: "多くの活動と人々に囲まれているとき、人生がより活気があり意味深いと感じる。", zh: "当我置身于各种活动和人群中时，会觉得生活更有活力和意义。", fr: "La vie me semble plus vivante et plus riche de sens quand je suis entouré d'activités et de personnes.", es: "La vida me parece más vibrante y significativa cuando estoy rodeado de actividades y personas." },
  { ko: "나는 빠른 결정을 내리고 나중에 수정하는 방식을 선호한다.", en: "I prefer making quick decisions and adjusting later.", ja: "素早く決断して後で修正する方を好む。", zh: "我更喜欢先快速做决定，再之后调整。", fr: "Je préfère prendre des décisions rapidement, puis ajuster ensuite.", es: "Prefiero tomar decisiones rápidas y ajustar después." },
  { ko: "새로운 상황이나 변화가 불안하기보다 자극적으로 느껴진다.", en: "New situations and change feel stimulating rather than anxiety-inducing.", ja: "新しい状況や変化が不安より刺激的に感じられる。", zh: "新的情况或变化带给我的更多是刺激感，而不是焦虑。", fr: "Les situations nouvelles et le changement me stimulent plus qu'ils ne m'angoissent.", es: "Las situaciones nuevas y los cambios me resultan estimulantes más que ansiosos." },
  { ko: "나는 깊이 있는 1:1 대화보다 활발한 그룹 대화를 더 즐긴다.", en: "I enjoy lively group conversations more than deep one-on-one talks.", ja: "深い1対1の会話より、活発なグループ会話をより楽しむ。", zh: "相比深入的一对一谈话，我更享受活跃的小组对话。", fr: "J'apprécie davantage les conversations de groupe animées que les échanges profonds en tête-à-tête.", es: "Disfruto más las conversaciones grupales animadas que las charlas profundas uno a uno." },
  { ko: "행동하면서 배우는 것이 먼저 계획하고 분석하는 것보다 더 편하다.", en: "Learning by doing feels more comfortable than planning and analyzing first.", ja: "行動しながら学ぶことが、まず計画し分析することより快適だ。", zh: "相比先计划和分析，我更适应边做边学。", fr: "Apprendre en faisant me convient mieux que planifier et analyser d'abord.", es: "Aprender haciendo me resulta más cómodo que planificar y analizar primero." },
];

function getSpectrum(score: number): Spectrum {
  if (score <= 12) return "deep_introvert";
  if (score <= 22) return "introvert";
  if (score <= 32) return "ambivert";
  if (score <= 42) return "extrovert";
  return "deep_extrovert";
}

const scaleLabels: Record<SupportedLocale, string[]> = {
  ko: ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"],
  en: ["Not at all", "Rarely", "Neutral", "Often", "Very much so"],
  ja: ["全くない", "ほとんどない", "普通", "よくある", "とてもそうだ"],
  zh: ["完全不是", "不太是", "一般", "比较符合", "非常符合"],
  fr: ["Pas du tout", "Rarement", "Neutre", "Souvent", "Tout à fait"],
  es: ["Para nada", "Rara vez", "Neutral", "A menudo", "Totalmente"],
};

const spectrumData: Record<Spectrum, { emoji: string }> = {
  deep_introvert: { emoji: "🌿" },
  introvert: { emoji: "🌙" },
  ambivert: { emoji: "☀️" },
  extrovert: { emoji: "🌟" },
  deep_extrovert: { emoji: "🔥" },
};

const ui: Record<SupportedLocale, {
  title: string; scale: string; progress: string; resultTitle: string;
  restart: string; share: string; copied: string;
}> = {
  ko: { title: "내향/외향 스펙트럼 테스트", scale: "이 문장이 나를 얼마나 잘 설명하나요?", progress: "질문", resultTitle: "현재 답변 돌아보기", restart: "다시 테스트하기", share: "결과 링크 공유", copied: "링크를 복사했어요!" },
  en: { title: "Introvert/Extrovert Spectrum Test", scale: "How well does this statement describe you?", progress: "Question", resultTitle: "Reflect on your current answers", restart: "Retake test", share: "Share result link", copied: "Link copied!" },
  ja: { title: "内向/外向スペクトラムテスト", scale: "この文章はどれくらい自分を表していますか？", progress: "質問", resultTitle: "今回の回答を振り返ります", restart: "もう一度回答する", share: "結果リンクを共有", copied: "リンクをコピーしました！" },
  zh: { title: "内向/外向光谱测试", scale: "这句话有多符合你？", progress: "问题", resultTitle: "回顾本次回答", restart: "重新回答", share: "分享结果链接", copied: "链接已复制！" },
  fr: { title: "Test du spectre introversion/extraversion", scale: "Dans quelle mesure cette phrase vous décrit-elle ?", progress: "Question", resultTitle: "Revenir sur vos réponses actuelles", restart: "Répondre à nouveau", share: "Partager le lien du résultat", copied: "Lien copié !" },
  es: { title: "Test del espectro introversión/extroversión", scale: "¿En qué medida le describe esta frase?", progress: "Pregunta", resultTitle: "Reflexione sobre sus respuestas actuales", restart: "Volver a responder", share: "Compartir enlace del resultado", copied: "¡Enlace copiado!" },
};

export default function IntroExtroTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];
  const c = introvertResultCopy[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ spectrum: Spectrum; score: number } | null>(null);
  // 2026-10-09: viewing somebody else's query result must not create a completion in this visitor's history.
  useRecordFinishedTest({ testId: "intro-extro", title: "IntroExtroTest", finished: Boolean(result) && answers.length === questions.length });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ie = p.get("ie") as Spectrum | null;
    const is = p.get("is");
    // 2026-10-09: shared query values are untrusted, not verified answers or a clinical record.
    // Reject inherited keys, partial numbers and contradictory category/score pairs before rendering.
    if (!ie || !Object.hasOwn(spectrumData, ie) || !is || !/^(0|[1-9][0-9]*)$/.test(is)) return;
    const score = Number(is);
    if (score > questions.length * 4 || getSpectrum(score) !== ie) return;
    setResult({ spectrum: ie, score });
  }, []);

  function pick(score: number) {
    const next = answers.slice(0, idx);
    next[idx] = score;
    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(next.length), 280);
    } else {
      const total = next.reduce((a, b) => a + b, 0);
      const spectrum = getSpectrum(total);
      setAnswers(next);
      setResult({ spectrum, score: total });
      const url = new URL(window.location.href);
      url.searchParams.set("ie", spectrum);
      url.searchParams.set("is", String(total));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function previous() {
    if (idx === 0) return;
    setIdx(idx - 1);
  }

  function restart() {
    setIdx(0); setAnswers([]); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ie"); url.searchParams.delete("is");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: t.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (result) {
    const d = spectrumData[result.spectrum];
    const maxScore = questions.length * 4; // 48
    const shared = answers.length !== questions.length;
    const band = c.bands[result.spectrum];

    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">{shared ? c.sharedTitle : t.resultTitle}</h1>
          <div className="text-4xl" aria-hidden="true">{d.emoji}</div>
          <p className="font-semibold text-primary">{band.label}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between gap-4 text-xs text-muted-foreground">
            <span>{c.low}</span>
            <span>{c.high}</span>
          </div>
          <meter min={0} max={maxScore} value={result.score} aria-label={c.scoreLabel} className="h-4 w-full">
            {result.score} / {maxScore}
          </meter>
          <p className="text-center text-sm text-muted-foreground">{c.scoreLabel}: {result.score} / {maxScore}</p>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <p className="leading-relaxed text-foreground">{shared ? c.sharedNote : band.description}</p>
          <section aria-labelledby="introvert-reflection-title" className="space-y-3">
            <h2 id="introvert-reflection-title" className="font-semibold text-foreground">{c.reflectionTitle}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
              {c.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
            </ul>
          </section>
          <a href={`/${locale}/introvert-extrovert-science/`} className="text-sm text-primary underline underline-offset-4">{c.articleLink}</a>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{c.note}</p>
        <ShareResultButton
          locale={locale}
          heading={shared ? c.sharedTitle : t.resultTitle}
          emoji={d.emoji}
          resultTitle={band.label}
          description={`${c.scoreLabel}: ${result.score} / ${maxScore}. ${shared ? c.sharedNote : c.note}`}
        />
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={restart} className="rounded-full bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground">{t.restart}</button>
          <button type="button" onClick={share} className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{copied ? t.copied : t.share}</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  return (
    <Questionnaire
      title={t.title}
      subtitle={c.metaDescription}
      question={q[locale]}
      questionLabel={`${t.progress} ${idx + 1} / ${questions.length}`}
      progress={Math.round((answers.length / questions.length) * 100)}
      options={scaleLabels[locale].map((label, i) => ({ label, value: i }))}
      selectedValue={answers[idx]}
      note={t.scale}
      previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question')}
      onPrevious={idx > 0 ? previous : undefined}
      onSelect={pick}
    />
  );
}
