// 크리스마스 성격 테스트 (2026-11-21). 문항·결과: data/christmas-personality.ts
import { useState } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";
import { gaEvent } from "@/lib/analytics/ga-event";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { XMAS_QUESTIONS, XMAS_RESULTS, XMAS_TYPES, xmasResult, type XmasLang, type XmasType } from "@/data/christmas-personality";
import ShareResultButton from "../shared/ShareResultButton";

const LANGS: XmasLang[] = ["ko", "en", "ja", "zh", "fr", "es"];
const L: Record<XmasLang, { title: string; subtitle: string; prev: string; note: string; your: string; gift: string; match: string; mix: string; restart: string; days: (n: number) => string }> = {
  ko: { title: "크리스마스 성격 테스트", subtitle: "나는 어떤 크리스마스 캐릭터일까?", prev: "이전 질문", note: "재미로 보는 테스트예요. 가장 많이 고른 유형이 결과가 돼요.", your: "나의 크리스마스 유형", gift: "올해의 추천", match: "잘 맞는 짝", mix: "내 답의 구성", restart: "다시 하기", days: (n) => `크리스마스까지 ${n}일` },
  en: { title: "Christmas Personality Test", subtitle: "Which Christmas character are you?", prev: "Previous question", note: "Just for fun. The type you pick most becomes your result.", your: "Your Christmas type", gift: "This year’s tip", match: "Best match", mix: "Your answers", restart: "Take it again", days: (n) => `${n} days until Christmas` },
  ja: { title: "クリスマス性格テスト", subtitle: "あなたはどのクリスマスキャラ？", prev: "前の質問", note: "楽しむためのテストです。いちばん多く選んだタイプが結果になります。", your: "あなたのクリスマスタイプ", gift: "今年のおすすめ", match: "相性のいい相手", mix: "回答の内訳", restart: "もう一度", days: (n) => `クリスマスまであと${n}日` },
  zh: { title: "圣诞性格测试", subtitle: "你是哪个圣诞角色？", prev: "上一题", note: "仅供娱乐。你选得最多的类型就是结果。", your: "你的圣诞类型", gift: "今年的建议", match: "最合拍的搭档", mix: "你的答案构成", restart: "再测一次", days: (n) => `距离圣诞节还有 ${n} 天` },
  fr: { title: "Test de personnalité de Noël", subtitle: "Quel personnage de Noël êtes-vous ?", prev: "Question précédente", note: "Pour s’amuser. Le type le plus choisi devient votre résultat.", your: "Votre type de Noël", gift: "Le conseil de l’année", match: "Meilleur duo", mix: "Vos réponses", restart: "Recommencer", days: (n) => `Noël dans ${n} jours` },
  es: { title: "Test de personalidad navideña", subtitle: "¿Qué personaje navideño eres?", prev: "Pregunta anterior", note: "Solo por diversión. El tipo que más elijas será tu resultado.", your: "Tu tipo navideño", gift: "Consejo del año", match: "Tu mejor pareja", mix: "Tus respuestas", restart: "Repetir", days: (n) => `Faltan ${n} días para Navidad` },
};

function daysToChristmas(now = new Date()): number {
  const y = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear();
  const xmas = new Date(y, 11, 25);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((xmas.getTime() - today.getTime()) / 86_400_000);
}

export default function ChristmasPersonalityTest({ locale = "ko" }: { locale?: string }) {
  const l: XmasLang = LANGS.includes(locale as XmasLang) ? (locale as XmasLang) : "en";
  const t = L[l];
  const questions = XMAS_QUESTIONS[l];
  const [current, setCurrent] = useState(0);
  const [votes, setVotes] = useState<XmasType[]>([]);
  const [result, setResult] = useState<XmasType | null>(null);
  useRecordFinishedTest({ testId: "christmas-personality", title: "ChristmasPersonalityTest", finished: Boolean(result) });

  function pick(type: XmasType) {
    if (current === 0 && votes.length === 0) gaEvent("test_started", { test_id: "christmas-personality" });
    // 되돌아가 다시 고르면 그 뒤 응답은 버려요.
    const next = votes.slice(0, current);
    next[current] = type;
    setVotes(next);
    if (current + 1 >= questions.length) {
      const r = xmasResult(next);
      setResult(r);
      gaEvent("test_completed", { test_id: "christmas-personality", result: r });
    }
    setCurrent(current + 1);
  }

  if (!result) {
    const q = questions[current];
    return (
      <Questionnaire<string>
        title={t.title}
        subtitle={`${t.subtitle} · ${t.days(daysToChristmas())}`}
        question={q.text}
        questionLabel={`${current + 1} / ${questions.length}`}
        progress={Math.round((current / questions.length) * 100)}
        options={q.options.map(([label, value]) => ({ label, value }))}
        selectedValue={votes[current]}
        note={t.note}
        previousLabel={t.prev}
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={(v) => pick(v as XmasType)}
      />
    );
  }

  const r = XMAS_RESULTS[result][l];
  const m = XMAS_RESULTS[r.match][l];
  const counts = XMAS_TYPES.map((k) => ({ k, n: votes.filter((v) => v === k).length }));
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">{t.your}</p>
        <h1 className="text-3xl font-black text-foreground">
          <span aria-hidden="true">{r.emoji}</span> {r.title}
        </h1>
        <p className="font-bold text-primary">{r.tagline}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{r.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground">{t.gift}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{r.gift}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground">{t.match}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{m.emoji} {m.title} · {m.tagline}</p>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">{t.mix}</h2>
        {counts.map(({ k, n }) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="w-28 shrink-0 text-foreground">{XMAS_RESULTS[k][l].emoji} {XMAS_RESULTS[k][l].title}</span>
            <progress className="h-2 flex-1 accent-primary" value={n} max={questions.length} aria-label={XMAS_RESULTS[k][l].title} />
            <span className="w-8 text-right text-muted-foreground">{n}/{questions.length}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { setVotes([]); setCurrent(0); setResult(null); }}
        className="min-h-11 w-full rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-accent"
      >
        {t.restart}
      </button>
      <ShareResultButton locale={locale} heading={t.title} resultTitle={r.title} emoji={r.emoji} description={r.tagline} analyticsId="christmas-personality" />
    </div>
  );
}
